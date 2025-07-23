---
title: KNN 的浅薄学习笔记
date: 2025-07-22 17:32:37
tags:
- python
- machine learning
---

今天了解了一下机器学习，看到了`KNN`这种算法，因为没搞懂，所以打算把学习过程写成博文辅助自己理解

代码参考 kaggle 上的 [Handwritten digits Classification(Using KNN )](https://www.kaggle.com/code/marwaf/handwritten-digits-classification-using-knn) 和 [Movie Ratings and Recommendation using KNN](https://www.kaggle.com/code/heeraldedhia/movie-ratings-and-recommendation-using-knn)

## 这是啥？

`KNN`，全称 " k-nearest neighbor classification"，是一种机器学习算法，它是一种基于分类的有监督学习方式，核心思想是“相似样本有相似输出”，从一大堆数据集中进行训练，所以会有训练集，和测试集，一般是三七开或者二八开，训练集会把样本和标记全部给到模型，然后库比如 `scikit-learn` 或者 `pytorch` 会对数据进行处理，或者你可以手动实现，然后你给它个新的值就能做预测。其中`KNN`中的 `K` 代表的是 `k` 值，表示这个新的东西临近的样本的个数，`k` 值会直接影响模型判断的准确率，如果 `k` 值过大可能就欠拟合，也就是没找到规律；`k` 值过小就是过拟合，简单说就是新数据的不认识，只认识训练数据，接下来是实现和使用过程

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

下面这个音乐分类的例子采用了面向对象的思想

```python
import random
from typing import List, Dict, Tuple, Optional
from py_linq import Enumerable

GENRES = ["classical", "rock", "jazz", "pop", "hiphop", "electronic"]

ARTISTS = {
    "classical": ["Bach", "Mozart", "Beethoven", "Chopin", "Tchaikovsky"],
    "rock": ["The Beatles", "The Rolling Stones", "Queen", "AC/DC", "Nirvana"],
    "jazz": ["Miles Davis", "Louis Armstrong", "Duke Ellington", "Charlie Parker"],
    "pop": ["Taylor Swift", "Ed Sheeran", "Rihanna", "Bruno Mars"],
    "hiphop": ["Jay-Z", "Kendrick Lamar", "Eminem", "Drake"],
    "electronic": ["Deadmau5", "Daft Punk", "Avicii", "Skrillex"]
}

KEYS = ["C Major", "D Major", "E Major", "F Major", "G Major", "A Major", "B Major",
        "C Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Minor", "B Minor"]

LANGUAGES = ["English", "中文", "한국어", "日本語", "Español", "Русский язык", "اللغة العربية", "Français"]

class Music:
    def __init__(self, title, genre, bpm, artist, key, lang, complexity, is_labeled = False):
        self.title = title
        self.genre = genre
        self.bpm = bpm
        self.artist = artist
        self.key = key
        self.lang = lang
        self.complexity = complexity
        self.is_labeled = is_labeled

    def __repr__(self) -> str:
        return f"{self.title}: {self.genre} (BPM: {self.bpm:.1f}, Artist: {self.artist})"
    
    def artist_diff(self, other):
        if(self.artist == other.artist):
            return 0
            
        self_artist_key = (Enumerable(ARTISTS.items())
                           .where(lambda x : self.artist in x[1])
                           .select(lambda x : x[0])
                           .first())
        
        return 1 if other.artist in ARTISTS[self_artist_key] else 2
        
    def genres_diff(self, other):
        return 0 if self.genre == other.genre else 2
    
    def keys_diff(self, other):
        return 0 if self.key == other.key else 2
        
    def langs_diff(self, other):
        return 0 if self.lang == other.lang else 2
    
    def bpm_diff(self, other):
        return abs(self.bpm - other.bpm)
    
    def distance(self, other):
        return self.artist_diff(other) + self.bpm_diff(other) + self.genres_diff(other) + self.keys_diff(other) + self.langs_diff(other)

class Music_Collection:
    def __init__(self, l):
        self.l = l

    def find_neighbors(self, music, num):
        distances = []
        for item in self.l:
            if(item == music):
                continue
            distances.append((music.distance(item), item))

        distances.sort(key=lambda x : x[0])
        return [item for (dist, item) in distances[:num]]

# Generated By AI
class MusicDataGenerator:
    """静态音乐数据生成器类，提供静态方法生成符合特征范围的随机数据集"""
    # 静态方法无需实例化即可调用
    @staticmethod
    def set_seed(seed: int) -> None:
        """设置随机种子，用于复现结果"""
        random.seed(seed)
    
    @staticmethod
    def generate_music(genre: str, title: str, is_labeled: bool = True) -> Music:
        GENRE_FEATURE_RANGES = {
        "classical": {"bpm_min": 60, "bpm_max": 120, "complexity": (7, 10)},
        "rock": {"bpm_min": 100, "bpm_max": 160, "complexity": (5, 8)},
        "jazz": {"bpm_min": 80, "bpm_max": 140, "complexity": (6, 10)},
        "pop": {"bpm_min": 100, "bpm_max": 130, "complexity": (3, 6)},
        "hiphop": {"bpm_min": 80, "bpm_max": 110, "complexity": (4, 7)},
        "electronic": {"bpm_min": 120, "bpm_max": 180, "complexity": (5, 9)}
        }
        """生成一首特定类型的音乐"""
        if genre not in GENRE_FEATURE_RANGES:
            raise ValueError(f"Unknown genre: {genre}")
            
        features = GENRE_FEATURE_RANGES[genre]
        
        # 在类型特征范围内生成BPM
        bpm = random.uniform(features["bpm_min"], features["bpm_max"])
        
        # 从该类型的艺术家列表中随机选择
        artist = random.choice(ARTISTS[genre])
        
        # 随机选择音调和语言
        key = random.choice(KEYS)
        lang = random.choice(LANGUAGES)
        
        # 生成复杂度
        complexity = random.uniform(features["complexity"][0], features["complexity"][1])
        
        return Music(
            title=title,
            genre=genre,
            bpm=bpm,
            artist=artist,
            key=key,
            lang=lang,
            complexity=complexity,
            is_labeled=is_labeled
        )
    
    @staticmethod
    def generate_by_genre(genre: str, count: int = 1, start_index: int = 0) -> List[Music]:
        """生成指定数量的特定类型音乐"""
        music_list = []
        for i in range(count):
            title = f"{genre}_track_{start_index + i + 1}"
            music = MusicDataGenerator.generate_music(genre, title)
            music_list.append(music)
        return music_list
    
    @staticmethod
    def generate_balanced_dataset(total_count: int = 1) -> List[Music]:
        """生成均衡的数据集，每个类型数量大致相同"""
        genre_count = len(GENRES)
        base_count = total_count // genre_count
        remainder = total_count % genre_count
        
        dataset = []
        current_index = 0
        
        for i, genre in enumerate(GENRES):
            # 分配数量，处理余数
            count = base_count + (1 if i < remainder else 0)
            genre_tracks = MusicDataGenerator.generate_by_genre(genre, count, current_index)
            dataset.extend(genre_tracks)
            current_index += count
        
        # 打乱数据集顺序
        random.shuffle(dataset)
        return dataset
    
    @staticmethod
    def generate_unknown_music(count: int = 1) -> List[Music]:
        """生成指定数量的未分类音乐"""
        unknowns = []
        for i in range(count):
            # 随机选择一个类型作为基础，但不设置标签
            genre = random.choice(GENRES)
            title = f"unknown_track_{i+1}"
            music = MusicDataGenerator.generate_music(genre, title, is_labeled=False)
            music.genre = "unknown"  # 清除标签
            unknowns.append(music)
        return unknowns

if(__name__ == "__main__"):
    # random seed insure reproducible
    MusicDataGenerator.set_seed(45)
    training_data = MusicDataGenerator.generate_balanced_dataset(1000)
    collection = Music_Collection(training_data) # training data generate

    # unknown music genrate
    # unknown_tracks = MusicDataGenerator.generate_by_genre("pop")
    # unknown_tracks = MusicDataGenerator.generate_by_genre("classical")
    # unknown_tracks = MusicDataGenerator.generate_by_genre("rock")
    unknown_tracks = MusicDataGenerator.generate_by_genre("electronic")
    print(f"Unknown tracks detail is:{unknown_tracks[0]}")
    print("\nFound Tracks:")
    found_tracks = collection.find_neighbors(unknown_tracks[0], 10)
    for track in found_tracks:
        print(track)
```

   