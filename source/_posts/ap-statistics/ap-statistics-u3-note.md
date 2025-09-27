---
title: AP Statistics U3 Note
date: 2025-09-25 20:25:13
tags: 
- AP
- AP Statistics
categories:
- AP Statistics
mathjax: true
---

## 3.1 Scatterplots and Correlation

新的词：
自变量 --> explanatory variables => help to explain
因变量 --> response variables => measures the outcome 

### Scatterplots

relationship, two quantitative variables, same individuals

- axis
- spots

怎么描述

- overall pattern
    - direction (positive association)
    - form (linear pattern, exponential, logarithmic)
    - strength (do not very much from the linear pattern)
- 偏离该 pattern 的情况 --> outliers

> There is a positive relationship between duration and interval. There seems to be a linear pattern in the graph. The points do not very much from the linear pattern. There do not appear to have any outliers

### Correlation

the ==direction== and ==strength== of the linear relationship

formula:
$$
r=\frac{1}{n-1}\sum(\frac{x_i-\bar{x}}{s_x})(\frac{y_i-\bar{y}}{s_y})
$$

$$
-1 <= r <= 1
$$

$r > 0$ => positive association 

解释 $r$ 的数值 ( $r = 0.936$ )

> There is a very strong positive association between A and B.

**Correlation does not imply causation**

## 3.2 Least-Squares Regression

Regression line => a line could used to predict y according to x
$$
\hat{y}=b_0+b_1x
$$
$\hat{y}$: predicted value from the model

解释$b_1$:

> The value y increase/decrease by $b_1$ for each additional increase in x 

解释$b_0$:

> When x equals to 0 the value y.
