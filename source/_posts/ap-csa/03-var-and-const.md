---
title: AP CSA 03-Variables and Constants（WIP）
date: 2025-09-22 16:11:15
tags:
- AP
- Java
- AP CSA
categories:
- AP CSA
---

这里应该还是在[考纲](../00-about-ap-csa#考试大纲)Unit 1的范围之内，今天讲一个编程中很常见的话题：变量和常量

## 变量 (Variables)

首先是变量，变量 (Variables) 你就想象成一个容器 (Container)，可以用来存放任何东西，比如：数字、文本、符号、对象(这个后面会讲)

那么变量究竟该如何被定义（创建）呢？我们在 Java 中是这样操作的：

```Java
//<数据类型><空格><变量名>;
//比如：
int a;
//这里就是定义了一个名字为 a 的 int 类型变量
```

好的那么我们总得个 a 里面放一个东西吧？这个放东西的操作叫做赋值，赋值的操作是这样的：

```Java
a = 10;
//这里就是给 a 设置了一个数字 10
//也可以在变量定义的时候给它赋值，叫做赋初始值，我们这里来创建一个值为 3.5 的 double 类型的变量 b
double b = 3.5;
```
String 变量的定义是这样的，文本的内容需要用双引号引起来
```Java
String s = "Hello World";
//意思是创建了一个名字叫 s 的文本内容为 "Hello World" 的String变量
```
准确说这个应该是String类型的对象，但是这里为了方便理解先统一叫做变量

那么这里我们来补充一个AP用不到的知识点，听得懂就记着，听不懂就算了，不用死抠
Java支持自动类型推导，也就是我们可以通过给初始值的方式让Java编译器自动识别这个变量应该是什么类型的，例子：
```Java
var c = 5;
//var 是用于创建自动类型推导变量的关键字
//因为值是 5，所以Java自动推导类型为 int
//整个的意思就是，创建一个，初始值为 5，自动推导类型为 int 的变量
//等价于 int c = 5
```
{% notel red fa-circle-info 警告 %}
不要在FRQ（简答题）里面这么写，给我乖乖写清楚变量类型！这里只是作知识补充
{% endnotel %}

好的接下来是个重点，变量名称不能是编译器预定关键字，这些东西编译器另有他用，不能用于取名
包括上一章里面的所有数据类型和bool的值，全部的都列在下面了，你要脑力充足可以去背，我建议是不用背，变量取名的时候稍微复杂一丢丢就好了：

### Java 保留关键字（Java Reserved Keywords）

#### 1. 数据类型与值类型 (Data Types & Literals)
| 关键字 | 含义 |
|--------|------|
| byte | 8 位整数类型 |
| short | 16 位整数类型 |
| int | 32 位整数类型 |
| long | 64 位整数类型 |
| float | 32 位浮点数类型 |
| double | 64 位浮点数类型 |
| char | 单个 Unicode 字符 |
| boolean | 布尔类型（true/false） |
| true | 布尔真值 |
| false | 布尔假值 |
| null | 空引用字面值 |
| void | 无返回值类型 |

#### 2. 类与对象 (Classes, Objects & Interfaces)
| 关键字 | 含义 |
|--------|------|
| class | 定义类 |
| interface | 定义接口 |
| enum | 定义枚举类型 |
| extends | 类继承或接口继承 |
| implements | 类实现接口 |
| this | 当前对象引用 |
| super | 父类对象引用 |
| new | 创建对象实例 |
| instanceof | 测试对象类型 |
| package | 声明包名 |
| import | 引入类或包 |

#### 3. 访问控制与修饰符 (Access & Modifiers)
| 关键字 | 含义 |
|--------|------|
| public | 公有访问修饰符 |
| protected | 受保护访问修饰符 |
| private | 私有访问修饰符 |
| static | 静态成员或方法 |
| final | 不可修改、最终定义 |
| abstract | 抽象类或方法 |
| synchronized | 同步控制（多线程） |
| volatile | 多线程可见性变量 |
| transient | 序列化时跳过的成员 |
| native | 使用本地（C/C++）方法 |
| strictfp | 限定浮点计算精度 |

#### 4. 控制语句 (Control Flow)
| 关键字 | 含义 |
|--------|------|
| if | 条件判断 |
| else | 条件分支 |
| switch | 多分支选择 |
| case | switch 分支 |
| default | 默认分支 |
| for | 循环 |
| while | 循环 |
| do | 循环（先执行后判断） |
| break | 跳出循环或 switch |
| continue | 跳过当前循环 |
| return | 返回结果 |
| yield | 从 switch 表达式返回值（Java 14+） |

#### 5. 异常与错误处理 (Exception Handling)
| 关键字 | 含义 |
|--------|------|
| try | 异常捕获块 |
| catch | 捕获异常 |
| finally | 无论异常与否都会执行 |
| throw | 抛出异常 |
| throws | 声明可能抛出的异常 |
| assert | 断言条件（调试用） |

#### 6. 继承与多态 (Inheritance & Polymorphism)
| 关键字 | 含义 |
|--------|------|
| super | 引用父类 |
| this | 引用当前对象 |
| instanceof | 判断类型关系 |

#### 7. 模块系统 (Modules, since Java 9)
| 关键字 | 含义 |
|--------|------|
| module | 定义模块 |
| requires | 声明模块依赖 |
| exports | 导出包 |
| opens | 允许反射访问包 |
| uses | 声明使用服务接口 |
| provides | 提供服务实现 |
| to | 限定导出目标模块 |
| with | 指定服务实现类 |

---

**Java 当前共有 67 个保留关键字 + 3 个字面值 (`true`, `false`, `null`)。**
