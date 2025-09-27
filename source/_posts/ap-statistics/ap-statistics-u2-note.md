---
title: AP Statistics U2 Note
date: 2025-09-25 20:23:01
tags: 
- AP
- AP Statistics
categories:
- AP Statistics
mathjax: true
---

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
z=\frac{x_i-\bar{x}}{ s_x }
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
