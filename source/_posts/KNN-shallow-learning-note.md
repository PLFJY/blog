---
title: KNN的浅薄学习笔记
date: 2025-07-22 17:32:37
tags:
- python
- machine learning
---

今天了解了一下机器学习，看到了`KNN`这种算法，因为没搞懂，所以打算把学习过程写成博文辅助自己理解

代码参考 kaggle 上的 [Handwritten digits Classification(Using KNN )](https://www.kaggle.com/code/marwaf/handwritten-digits-classification-using-knn) 和 [Movie Ratings and Recommendation using KNN](https://www.kaggle.com/code/heeraldedhia/movie-ratings-and-recommendation-using-knn)

## 这是啥？

`KNN` 是一种机器学习算法，它是一种基于分类的有监督学习方式，核心思想是“相似样本有相似输出”，从一大堆数据集中进行训练，所以会有训练集，和测试集，一般是三七开或者二八开，训练集会把样本和标记全部给到模型，然后库比如 `scikit-learn` 或者 `pytorch` 会对数据进行处理，或者你可以手动实现，然后你给它个新的值就能做预测。其中`KNN`中的 `K` 代表的是 `k` 值，表示这个新的东西临近的样本的个数，`k` 值会直接影响模型判断的准确率，如果 `k` 值过大可能就欠拟合，也就是没找到规律；`k` 值过小就是过拟合，简单说就是新数据的不认识，只认识训练数据，接下来是实现和使用过程

## 怎么实现？

### 使用现有库

以 Scikit-learn 举例，首先拿到数据，对数据进行预处理，学习的话一般数据会从数据集的库里拿，比如 `scikit-learn`自己的[数据集](https://scikit-learn.org) ，具体数据集对应的使用方法都在API文档里面，我们拿这个[Handwritten digits Classification(Using KNN )](https://www.kaggle.com/code/marwaf/handwritten-digits-classification-using-knn)的代码来做例子：

首先是数据导入和预处理

```python
from sklearn import datasets # 从库里获取数据集
from sklearn.cross_validation import train_test_split  # 用于数据集拆分（注意：新版本sklearn已移至model_selection）

mnist = datasets.load_digits() # 加载MNIST手写数字数据集，这个就是原始数据

# 拆分数据，测试集和训练集 2.5 7.5开
(trainData, testData, trainLabels, testLabels) = train_test_split(
    np.array(mnist.data),  # 图像数据（反正是处理过的）
    mnist.target,  # 标签（0-9的数字）
    test_size=0.25,  # 测试集占比
    random_state=42  # 保证复现结果的固定随机数种子
)

# 额外从训练集拿出来的验证集，和训练集一九开
(trainData, valData, trainLabels, valLabels) = train_test_split(
    trainData,  # 上一步得到的训练集数据
    trainLabels,  # 上一步得到的训练集标签
    test_size=0.1,  # 验证集占比（相对于当前训练集）
    random_state=84  # 保证复现结果的固定随机数种子
)

# 所以总结下来：
# trainData 是训练数据; trainLabels 是训练数据的答案
# testData 是测试数据; testLabels 是测试数据的答案
# valData 是验证数据; valLabels 是验证数据的答案
# 然后下面的代码是拿训练集和验证集来做 k 值尝试
```

然后是使用 `scikit-learn` 库来做机器学习，第一步是弄个 `k` 值预设表 `kVals`，之后的 `k` 值就会从这里一个一个试，试到满意为止

```python
kVals = range(1, 30, 2) # 1 ~ 30 之间的所有奇数，换成C#也就是 Enumerable.Range(1, 30).Where(x => x%2 != 0);
accuracies = [] # 存储准确率的列表
```

**这里是最重要的地方**，接下来就是一个一个试 `k` 值了

```python
# 导入几个新的工具
from sklearn.neighbors import KNeighborsClassifier  # K近邻分类器，说白了就是你的模型

for k in kVals: # 这里源代码不好，我做了一些改编
    model = KNeighborsClassifier(n_neighbors=k)  # 初始化模型，设置模型基本参数 (k值)
    model.fit(trainData, trainLabels)  # 拟合数据（其实就是训练模型，scikit-learn 帮你实现了）
	
    
    score = model.score(valData, valLabels) # 拿验证集去测一下训练好的模型，这一步也是 scikit-learn 实现好的，直接出准确率
    print(f'k值是{k}, 准确率是{score}') # 打印一下调试，不用管
    accuracies.append(score)  # 把得到的准确率存下来（话说为啥不用字典）
```

试出来所有 `k` 值对应的准确率后就该正式训练模型了

```python
# 导入一下新的工具
import numpy as np

i = np.argmax(accuracies)  # 利用 numpy 的 argmax 方法获取到最高的准确率的 index
print(f'k={kVals[i]}的时候准确率最高，准确率是{accuracies[i]}') # 打印一下调试，不用管

# 用最新的 k 值训练模型
model = KNeighborsClassifier(n_neighbors=kVals[i])
model.fit(trainData, trainLabels)
score = model.score(testData, testLabels) # 拿测试集去测一下训练好的模型，看看准确率
print(f'最终模型的准确率是{score}') # 最后看看准确率
```

差不多了，后面都是无关紧要的验证，最重要的是前面的实现，那么接下来就是手动实现的案例了

### 手动实现

[Movie Ratings and Recommendation using KNN](https://www.kaggle.com/code/heeraldedhia/movie-ratings-and-recommendation-using-knn) 的代码使用的是手动实现的方式，它实现了一个电影评价系统，开始它先导入了两张表

```python
import pandas as pd # 用来导入表的库
movies = pd.read_csv('../input/tmdb-movie-metadata/tmdb_5000_movies.csv') # 导入电影信息的表
credits = pd.read_csv('../input/tmdb-movie-metadata/tmdb_5000_credits.csv') # 导入工作人员信息的表
```

接着的部分是利用输出辨别数据结构，不是KNN讨论的重点，所以我们略过这一部分

接下来合并了两张表方便后续处理

```python
movies = movies.merge(credits,left_on='id',right_on='movie_id',how='left')
movies = movies[['id','original_title','genres','cast','vote_average','director','keywords']]
```

下面是它核心的算法部分，用于从多个维度计算两个电影之间的距离

```python
from scipy import spatial

def Similarity(movieId1, movieId2):
    # 分别提取两个电影的特征
    a = movies.iloc[movieId1]
    b = movies.iloc[movieId2]
    
    # 计算各特征向量的距离，使用的余弦
    genresA = a['genres_bin']
    genresB = b['genres_bin']
    genreDistance = spatial.distance.cosine(genresA, genresB)  # 类型距离
    
    scoreA = a['cast_bin']
    scoreB = b['cast_bin']
    scoreDistance = spatial.distance.cosine(scoreA, scoreB)  # 评分距离
    
    directA = a['director_bin']
    directB = b['director_bin']
    directDistance = spatial.distance.cosine(directA, directB)  # 导演距离
    
    wordsA = a['words_bin']
    wordsB = b['words_bin']
    wordsDistance = spatial.distance.cosine(wordsA, wordsB)  # 关键词距离(原代码此处笔误，已修正)
    
    # 总距离为各特征距离之和
    return genreDistance + directDistance + scoreDistance + wordsDistance
```

所以我们可以用下面的方式来调用这个函数

```python
Similarity(3,160) #checking similarity between any 2 random movies
```

下面，它定义了一个分数预测器 `predic_score(name)` 函数，这里面是模型训练和获取预测值的相关逻辑，详细拆解如下:

1. **这里是最重要的地方**，在这个函数里面，它先定义了一个“获取邻居”的方法

   ```python
   def getNeighbors(baseMovie, K):
       distances = []
       # 遍历所有电影，计算与目标电影的距离
       for index, movie in movies.iterrows(): 
           if movie['new_id'] != baseMovie['new_id'].values[0]:  # 排除自身
               dist = Similarity(baseMovie['new_id'].values[0], movie['new_id'])
               distances.append((movie['new_id'], dist))  # 以(电影ID，距离)的tuple来存储
       
       # 按距离升序排序（距离越小越相似）
       distances.sort(key=operator.itemgetter(1))
       
       # 取前K个最近邻
       neighbors = []
       for x in range(K):
           neighbors.append(distances[x])
       return neighbors
   ```

2. 下面是获取预测值的步骤，这里我已经把 `getNeighbors(baseMovie, K)` 抽象到上面了，方便理解

   ```python
   def predict_score(name):
       # 找到符合目标电影关键词的列表
       new_movie = movies[movies['original_title'].str.contains(name)].iloc[0].to_frame().T
       print('Selected Movie: ', new_movie.original_title.values[0])
       
       K = 10  # 取10个邻居，拟定 k 值为 10，实际并没有经过过测试
       neighbors = getNeighbors(new_movie, K)  # 获取最近的10个邻居
       
       # 输出匹配到的10个结果
       print('Recommended Movies: ')
       avgRating = 0
       for neighbor in neighbors:
           avgRating += movies.iloc[neighbor[0]]['vote_average']  # 累加近邻评分
           print(f"{movies.iloc[neighbor[0]]['original_title']} | Genres: {str(movies.iloc[neighbor[0]]['genres']).strip('[]').replace(' ','')} | Rating: {movies.iloc[neighbor[0]]['vote_average']}") # 打印匹配到的电影的详情
       
       # 预测评分（近邻平均评分）这步已经是多余了，主要是根据KNN的思想，假设相似的电影具有相似的属性，那么作用是，如果电影未上映，则可以预测出一个可能的评分
       avgRating /= K
       print(f'\nThe predicted rating for {new_movie["original_title"].values[0]} is: {avgRating}')
       print(f'The actual rating for {new_movie["original_title"].values[0]} is {new_movie["vote_average"].values[0]}')
   ```

   这就是关于这个的全部解析了

   下面是个人有关第二个手动实现的代码的一些想法

## 结合面向对象编程

那么我们现在看到，这个代码的遍历方式和比较方式是很笨拙的，可扩展性不高，要是再有多一点东西，基本上就能感觉到修改极其吃力，并且我们理解也需要花很高的成本

在我看来，我觉得这个电影可以直接写成一个类，然后电影集合也可以是一个类，这样提高了可服用性和可扩展性，同时在实际的应用开发中也提高了可维护性，以下代码为 AI 生成的实例，主要是为了体现面向对象编程的思想

```python
import pandas as pd
import numpy as np
from scipy import spatial

# 电影类
class Movie:
    def __init__(self, original_title, genres, vote_average, 
                 genres_bin, cast_bin, director_bin, words_bin):
        self.original_title = original_title  # 电影标题
        self.genres = genres                  # 类型
        self.vote_average = vote_average      # 评分
        self.genres_bin = genres_bin          # 类型二进制向量
        self.cast_bin = cast_bin              # 演员二进制向量
        self.director_bin = director_bin      # 导演二进制向量
        self.words_bin = words_bin            # 关键词二进制向量

    # 计算与另一部电影的相似度（距离越小越相似）
    def similarity(self, other):
        # 计算各特征的余弦距离
        genre_dist = spatial.distance.cosine(self.genres_bin, other.genres_bin)
        cast_dist = spatial.distance.cosine(self.cast_bin, other.cast_bin)
        director_dist = spatial.distance.cosine(self.director_bin, other.director_bin)
        words_dist = spatial.distance.cosine(self.words_bin, other.words_bin)
        
        # 总距离为各特征距离之和
        return genre_dist + cast_dist + director_dist + words_dist


# 电影集合类：管理所有电影，提供查询和推荐功能
class MovieCollection:
    def __init__(self, movies_df):
        # 将DataFrame转换为Movie对象列表
        self.movies = []
        for _, row in movies_df.iterrows():
            movie = Movie(
                original_title=row['original_title'],
                genres=row['genres'],
                vote_average=row['vote_average'],
                genres_bin=row['genres_bin'],
                cast_bin=row['cast_bin'],
                director_bin=row['director_bin'],
                words_bin=row['words_bin']
            )
            self.movies.append(movie)

    # 根据标题查找电影
    def find_movie(self, title):
        for movie in self.movies:
            if title in movie.original_title:
                return movie
        return None

    # 预测电影评分（通过K近邻）
    def predict_rating(self, title, k=10):
        target_movie = self.find_movie(title)
        if not target_movie:
            print(f"未找到电影：{title}")
            return

        print(f"选中的电影：{target_movie.original_title}")
        
        # 计算与其他所有电影的距离
        distances = []
        for movie in self.movies:
            if movie != target_movie:
                dist = target_movie.similarity(movie)
                distances.append((movie, dist))
        
        # 按距离排序，取前K个近邻
        distances.sort(key=lambda x: x[1])
        neighbors = distances[:k]

        # 输出推荐结果并计算平均评分
        print("\n推荐电影：")
        total_rating = 0
        for neighbor, _ in neighbors:
            total_rating += neighbor.vote_average
            genres_str = str(neighbor.genres).strip('[]').replace(' ', '')
            print(f"{neighbor.original_title} | 类型：{genres_str} | 评分：{neighbor.vote_average}")
        
        # 计算预测评分
        predicted_rating = total_rating / k
        print(f"\n《{target_movie.original_title}》的预测评分：{predicted_rating:.2f}")
        print(f"《{target_movie.original_title}》的实际评分：{target_movie.vote_average:.2f}")
```

   