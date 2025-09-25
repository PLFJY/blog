---
title: AP Statistics U1-Note
date: 2025-09-20 17:32:37
tags: 
- AP
- AP Statistics
categories:
- AP Statistics
mathjax: true
---

## Exam  Structure

40 MCQ + 6 FRQ

## 1.1 Data Analysis (数据的分类)

- Individual: 参与统计的个体

- variable: 一个特质（eg: gender、frequency）

- value: eg: gender里的细分比如Male、Female，frequency的细分：one time、often、 hardly

- count: 数量

### Categories of var

- Categorical Variable: `enum` `bool`

- Quantitative Variable: `int` `double`

- Distribution: Describe the condition of the data

- Population: Whole dataset

- Sample: Part of the dataset

### Analyze Variable

#### How to spot a misleading graph ?

1. missing axis labels or scale (刻度)
2. cut off x or y axis or start at a weird place
3. picture instead of a bar

#### Categorical: 
Pie chart / Bar chart / Two-way table

#### Quantitative: 
histogram / boxplot / bar chart

### Marginal distribution and Conditional distribution (Categorical Variable、Two-way table)

|          | Male | Female  | Total   |
| -------- | ---- | ------- | ------- |
| one time | num  | num `c` | num `a` |
| often    | num  | num     | num     |
| hardly   | num  | num     | num     |
| Total    | num  | num `d` | num `b` |

#### Marginal distribution: 
The proportion of count of all individuals in a variable among the total individuals (`a`/`b`) (`d` / `b`)

#### Conditional distribution: 
指定了条件(与另一个value的intersect)的values的count在指定总数中的占比，若没有指定总数，则默认为全部的总数(b)

#### Relative frequency: 
有可能是上面两个任意一个，看要求什么，不管怎么说分母都是 total

### Other graphs to describe data

[Segmented bar graph](https://cn.bing.com/images/search?q=Segmented+bar+graph&form=HDRSC2&first=1)

[Side by side bar graph](https://cn.bing.com/images/search?q=side+by+side+bar+graph&form=HDRSC2&first=1)

## 1.2 Displaying quantitative data with graphs

#### 分布 (shape)

### 描述分布 (4个维度 SCSO)

#### Shape

##### 正态分布 Normal Distribution（对称）

拱起来的在中间

##### 左偏 skew*倾斜* to the left 

左边much longer than the right

拱起来的在右边
$$
\text{mean}<\text{median}<\text{mode}
$$

##### 右偏 skew to the right

右边much longer than the left

拱起来在左边
$$
\text{mean}>\text{median}>\text{mode}
$$
![skew](ap-statistics-u1-note/skew.png)

#### Center

把整个数据分成两半

一般取 mean 或者 median

还可以叫做 typical

#### Spread 波动性

表示数据的离散程度，分散就大，聚合就小

一般用 Range 或者 [standard deviation](#Standard Deviation 标准方差)

#### Outliers 

异常值 （极大或极小）

[How to determine](#Identify outliers)

#### An example
> The data shows that the distribution is roughly symmetric.*(Reason)* Therefore it is approximately as a normal distribution.*(Shape)* The center of the data is between 227 and 252.*(Center)* The data varies from 56 to 422.*(Spread)* We do not see any observations outside the pattern of the distribution.*(Outliers)*

### Plots

Q: 选哪个图：
A: 选什么图，因为它是什么数据，什么图能更好的展示它的 distribution

#### Dot plot

#### Stem plot

记得一定要写 Key !!!!!

Key: 一个tips用来描述你展示的值represent什么东西

> eg:
> Key: 7|7 = 77 apples each day

#### Histogram

frequency histogram / relative frequency histogram (more useful)

- shows frequency
- no spaces each bar

##### Drawbacks

- no individual data just interval
- cannot find median

## 1.3 Describing Quantitative data with numbers

## Measuring Center

### Means

### Median

$Q_2$ (value at 50%)

### Mode

## Measuring Spread

### Range

maximum - minimum

### IQR (描述波动性的)

$Q_3$ (value at 75%) - $Q_1$ (value at 25%) 

#### Identify outliers:

$x < Q_1 - 1.5 \times IQR$	or	$x > Q_3 + 1.5 \times IQR$

#### Box Plot

1. number line + label
2. determine minimum, $Q_1$, $Q_2$(median), $Q_3$, and maximum
3. a line connect minimum and maximum
4. Box between $Q_1$ and $Q_3$
5. a line at $Q_2$
6. usually using median and IQR to measure the center and spread

> We only know: five values above
>
> We can't know: sample size, sample mean

### Standard Deviation 标准方差

$$
s_x>=0
$$
$$
s_x^2 = \frac{(x_1 - \bar{x})^2 + (x_2 - \bar{x})^2 + \cdots + (x_n - \bar{x})^2}{n - 1} = \frac{1}{n - 1} \sum (x_i - \bar{x})^2
$$
$$
s_x = \sqrt{\frac{1}{n - 1} \sum (x_i - \bar{x})^2} 
= \sqrt{s_x^2}
$$

s: sample variance 样本方差	VS	population variance 总体方差

Def: 数据围绕平均值的离散程度

使用条件：用mean去描述center的时候才可以用这个去描述数据的波动性

不具有抗性，可能由于outlier的影响变得更小或者更大

### Variance 方差 $>= 0$

## 2.1 Describing ==Location== in a Distribution

### Percentiles 百分位

有多少%的数值小于该值(n)

> a% of the data is less than / below n

### [Cumulative Relative Frequency Graphs](https://cn.bing.com/images/search?q=Cumulative+Relative+Frequency+Graphs&qs=n)

计算 Cumulative relative frequency：先求出累积相对频数，然后除总数

绘图：

纵轴：Cumulative relative frequency
横轴：每一组

横轴点：每组的Starting point()
纵轴点：前一组对应的Cumulative relative frequency *第一组对应的 Cumulative relative frequency 是 0%*

### Z-Scores (标准分数)

描述一个individual的数据比mean差了多少个Standard deviation

Formula: 

$$
z=\frac{x-\text{mean}}{ \text{ standard deviation } }
$$

> $x$ is below/above the mean by $z$ standard deviation

计算Z-Score的过程叫做数据标准化 (Standardizing)

标准化用于把数据拉到同一标准下，可以直接数值比较，不用考虑标准不同

### Teansforming Data

#### Add or Subtract

Chaged: 

- Center
- Location

Unchanged:

- shape
- IQR

#### Multiply and Divide

Changed:

- Center
- Range
- Location
- IQR

Unchanged:

- Shape

#### ==Standardizing==

- Mean / Center: 0
- Standard Diviation: 1

#### 对于数据改变的题的回答

> 描述变化的部分，然后与其它数据再次做比较（如有可说的点，类似雅思小作文）

## 2.2 Density Curves & Normal Distributions

### Density Curves

- is always on or above the horizontal axis
- has area exactly 1(100%) underneath it 

### Normal Distributions

Standard Diviation 越大越矮，反正越尖

- 距离 mean 1 个标准差是中间的部分是68%的数据
- 距离 mean 2 个标准差是中间的部分是95%的数据
- 距离 mean 3 个标准差是中间的部分是99.7%的数据

#### 利用Z-Score计算数值在Dataset中的位置情况

$N(0,1)$ 代表标准化后数据以0作为mean，1作为标准差得到的分布，N是Normal Distribution

如果出来一个奇奇怪怪的数字（不在上面三个里面），试卷后面会有一个对照表来查数据的占比（得到的这个proportion是指Z-Score左边的部分）

##### 算出两个Z-Score区间内的数据所占整体的比例

会被分成Standard Normal $N(0,1)$或者Normal (before standarded) $N(\mu \text{ (mean) },\sigma \text{ (Standard deviation) })$ 两种情况

找表然后相减

利用区间内的数据68% 95% 99.7%评估整个数据的正态性
