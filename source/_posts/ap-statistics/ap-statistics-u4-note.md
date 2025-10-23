---
title: AP Statistics U4 Note
date: 2025-10-09 20:47:20
tags: 
- AP
- AP Statistics
categories:
- AP Statistics
mathjax: true
---

## 4.1 Population and Samples

Population: 总体
Sample: 样本
根据样本估计总体

### 样本调查 (Sample survey) 三个步骤：

1. What we want to describe
2. What we want to measure
3. How to choose a sample

### 怎样是不好的样本

1. Convenience Sample 为了方便获取最容易接触到的个体 
    - Bias 偏差 --\> 持续低估/高估你想了解的数值 -- variability 
    - Unrepresentative 不具有代表性
2. Voluntary Samples 自愿样本，持有强烈相同观点的人更容易做出回应

### 三种抽样调查 (How to sample well)

#### simple random sample (SRS) 纯随机抽

- Using technology choose
    1. label
    1. randomize -- random generator
    
    > **Assign** numbers to each members and use a random generator to **randomly generate** 500 numbers between 1 to 70000. Finally **select** students whose name is correspond to these 500 random numbers.

#### stratified random sample

1. classified the population -- strata
2. choose a separate SRS from each group
3. combine these SRSs

按照某个分层方式🆚按照另一种方式

从每一个小类里面选出来一个然后这样使每一个样本都在它的小类内具有代表性

#### cluster sample 聚类样本

1. divided the population into smaller groups
2. each group could reflex the overall feature
3. choose SRSs from each group

### Inference for sampling 从样本推断总体

- sampling error: 预期会有多少样本变异 --> control random sample size
    - bad sample
    - convenience sample
    - voluntary
    - under coverage
    - nonresponse

## 4.2 Experiments and Observational study

### Observational study --> 得不到因果关系 (cause-effect)

observe and measure variables interested in but not influence the responses

观察个体互动，看特征和行为，但是不去干预，就看着

### Experiment --> 能得到因果关系 (cause-effect)

impose some treatment to measure response

实施一些方法，测反应

the only source of fully convincing data

#### Language

`treatment` (干预) 手段，措施

`experimental units` 实验单位（被施加了treatment的最小个体集合），如果是人的话叫做 `subject`

描述解释变量的时候经常能见到 `whether`，用于表示是否启用某个 treatment

有时候explanatory variable也叫做 `factor`，尤其是出现多种 explanatory variables 且有嵌套关系的时候

#### How experiment badly

- too simple design
- too many confounding variables

#### How experiment well 实验设计

##### Random assignment 随机分配，随机选人分配到不同的组 (每组数量相同) --> reduce effect by confounding variables

确保除 treatment 之外的因素在每个组内都保持不变 and each unit are similar  --> 控制effect of other variables

实验设计原则：

1. Comparison: 比较对象
2. Control: confounding variables
3. Random assignment: balancing the effect of uncontrolled variables on the treatment groups

    列举 treatments：1 2 3 4
4. Replication: 多次实验 (a large number of population)，为了区分 treatment 的 effect 和 其它变量的 effect

##### 完全随机设计 (Completely Randomized Designs)

基于 random assignment, **but 每种treatment的sample数量不要求一致**

controlled group --> base line **是必须的**

##### 实验可能会出现哪些问题？

1. placebo 效应 --> 假处理，解决掉心里层面的confounding variables
2. double-blind --> 以受试者和实验执行者不知道实验目的 + treatment 为前提的实验，避免受试者和实验执行者出现迎合实验结果的行为并使实验结果出现偏差 --> 隐藏 treatment
3. single-blind --> 实验执行者知情

| 特征                   | Single-blind                 | Double-blind                         |
| ---------------------- | ---------------------------- | ------------------------------------ |
| 参与者是否知道处理情况 | ❌ 不知道                     | ❌ 不知道                             |
| 实验者是否知道处理情况 | ✅ 知道                       | ❌ 不知道                             |
| 防止的偏差类型         | 参与者偏差（placebo effect） | 参与者 + 实验者偏差（observer bias） |
| 应用场景               | 教育、心理实验               | 医学、药物临床试验                   |

##### 实验结果推理 inference for experiments

Statistically significant 统计显著性 (只是概念引入)

解释 cause-effect

推理范围：

如果样本是随机选的，那么可以用样本来推整体

如果随机选出来又是随机分配，既可以推整体也可以解释 cause-effect

| 条件                   | 能否推广到总体（Inference about population） | 能否解释因果关系（Cause-and-effect） | 说明                               |
| ---------------------- | -------------------------------------------- | ------------------------------------ | ---------------------------------- |
| 非随机抽样，随机分配   | ❌ 不能推广到总体                             | ✅ 可以解释因果关系                   | 实验内因果有效，但只适用于样本     |
| 随机抽样，非随机分配   | ✅ 可以推广到总体                             | ❌ 不能解释因果关系                   | 没有随机分配，无法排除混杂变量     |
| 随机抽样，随机分配     | ✅ 可以推广到总体                             | ✅ 可以解释因果关系                   | 最理想的情况：既有代表性又有因果力 |
| 非随机抽样，非随机分配 | ❌ 不能推广到总体                             | ❌ 不能解释因果关系                   | 无代表性、无控制，结果局限于样本   |

### Confounding variables 混杂变量

与 explanatory variable 关联 & 影响response variable，且无法和explanatory variable区分是谁影响的response variable

当题目要找混杂变量的时候，需要解释所选的变量如何与explanatory variable关联且影响response variable

> b. Some other variables which could affect the number of new cavities and cannot be distinguished from one another such as other foods the patients eaten
