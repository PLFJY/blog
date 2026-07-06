---
title: AP CSA 06 - 面向对象编程 Pt.1
date: 2026-07-06T02:41:35.273Z
tags: 
- AP
- Java
- AP CSA
categories:
- AP CSA
mathjax: true
---

本章是面向对象编程的核心，对于本章节的理解关系到之后所有内容的学习，如有搞不懂的地方请务必反复阅读或者求助 AI 直到弄明白为止

本章节对应[考试大纲](../00-about-ap-csa#考试大纲)中 1.7、1.10、1.12、1.13、1.14、3.1～3.9 的内容

---

在第二章中我有介绍过许多 Java 当中的数据类型，那些都是基础数据类型，是构成一切的基础

那么对于类 (Class) 就是一种自定义的类型，那么我们从这里的一个例子开始：

我们要统计一个学生的数据，一个学生有
- 名字
- 学号
- 班级
- 年龄
- GPA

如果我们直接用已有的知识来写呢？那我们或许需要 5 个变量

```Java
String name;
int idNumber;
String className;
int grade;
int age;
double GPA;
```

那么问题来了，如果我们还需要再存一个学生呢？是不是就得这样？

```Java
// Student 1
String name1;
int idNumber1;
String className1;
int grade1;
int age1;
double GPA1;

// Student 2
String name2;
int idNumber2;
String className2;
int grade2;
int age2;
double GPA2;
```

哇，那如果有 10 个学生不得写到癫去。于是就引出了我们今天的主角——类

## 类是什么

类就是一种自定义的类型，它能很方便的提高代码的复用性，也就是说，我们刚刚的东西就不需要每个学生都写一组变量，那我们来看看类是怎么定义的吧，我们把刚刚的学生定义为一个学生类，先来看类的定义语法：

```Java
<访问修饰符> class <类名 (一般使用大驼峰)> {
    <主体内容>
}
```

有聪明人应该就发现了，我们第一章的这个东西：

```Java
public class <你刚刚敲进去的文件名> {
    
}
```

这玩意……不就是个类吗？没错这就是一个类

## 类的创建

也就是说，类是整个 Java 语言中的基石，一切都是基于类运作的，我们把刚刚的学生定义为一个学生类，那么学生就要有刚刚那几个属性 (Attribute)，我们写成下面这样：

```Java
public class Student {
    public String name1;
    public int idNumber1;
    public String className1;
    public int grade1;
    public int age1;
    public double GPA1;
    private String secrete = "我不告诉你"; // 至于这个是干什么的后面就知道了
}
```

那么这样，`Student` 就被我们注册成了一个类型，那这样的话我们就可以创建一个 `Student` 类型的变量了不是吗？

```Java
Student Tom;
```

现在我们看，我们只是声明了一个叫做 Tom 的变量，它还没有指向任何的对象，没有对象的类型变量是空壳子，所以我们需要 new 一个出来

```Java
Tom = new Student();
```

什么叫做 new 一个 `Student`？我们可以这样理解：

现在 Tom 这个变量只是一个门牌号，门牌号指向的得是一个房间才可以吧？光光一个门牌号是没有任何作用的，它一定得指一个东西才行

那这个时候我们 new 的这个 Student 一个全新的房间，Tom 就是指向这个房间的门牌号，那当我们像访问房间里的任意一个东西的时候，我们可以使用 `门牌号.成员` 来访问，比如我们要访问 Tom 的名字

```
System.out.println(Tom.name);
// 输出：
// 
```

但是，直接这么打印是空的，为什么？因为 Tom 这个对象是不是现在只是门牌上写着 Tom 里面，住着的这个还没有名字？那我们得先取个名字才行，不然打印不出任何东西：

```
Tom.name = "Tom";
```

好了，这下 Tom 的名字真的就是 Tom 了，这下执行 `System.out.println(Tom.name);` 就能输出 `Tom` 了

这个成员可以是变量，也可以是方法，就比如我们这里面有一个 say 的方法

```Java
public class Student {
    public void say(String message){
      System.out.println(message);
    }
}
```

我们还是 new 一个学生出来，这次我们叫 John，然后我们调用 John 的 say 方法

```Java
Student John = new Student();
John.say("Hello");
// 输出：
// Hello
```

不出意外应该能看到控制台输出了 `Hello`，这就是调用成员方法

这里是一个需要硬记的地方，如果我们什么对象都不给，直接就是一个

```Java
Student Jason;
```

此时这个 Jason 这个变量指向的就是一个 null，我们试着判断一下；

```
System.out.println(Jason == null);

// 输出: 
// true
```

我们不难发现，只要不是 8 大类型*，一个类型的变量没有指向任何实例那就是 null

> \* 8 大类型是指 int, float, double, char, boolean, short, byte, long
> 
> 不认识的不用管，AP 不考，这几种类型都有自己的初始值，他们是基础类型，不是类

## 访问修饰符

那么这时候我们突然想起最前面定义的 Student 里是不是有个秘密来着，我们试着拿一下 Tom 的秘密：

```
System.out.println(Tom.secrete);
// 输出：
// Exception in thread "main" java.lang.IllegalAccessException: class Main cannot access a member of class Student with modifiers "private"
    at java.base/jdk.internal.reflect.Reflection.newIllegalAccessException(Reflection.java:392)
    at java.base/java.lang.reflect.AccessibleObject.checkAccess(AccessibleObject.java:674)
    at java.base/java.lang.reflect.Field.checkAccess(Field.java:1102)
    at java.base/java.lang.reflect.Field.get(Field.java:423)
    at Main.main(Main.java:8)
```

拿不出来，为什么，没看到人家秘密前面有个 `private` 嘛！那是人家私人的东西，这里就引出了访问修饰符的概念

在 Java 中访问修饰符有三种：

- public：公开，哪里都能访问和修改
- private：私有，只有类里面内部可以访问和修改
- protected： 受保护的，只有类和它的子类里面能访问和修改

那么寄过很明确了，我们现在在这个程序入口的这个类里面，不在 `Student` 这个类当中，所以我们没办法访问到 Tom 的秘密，那如果我们逼 Tom 自己说出来呢？我们来先给这个 Student 里面加一个方法

```
public class Student {
    private String secrete = "我不告诉你";

    public void tellSecrete() {
      System.out.println(secrete);
    }
}
```

然后我们回到外面。调用 Tom 对象的 `tellSecrete()` 方法

```
System.out.println(Tom.tellSecrete());
// 输出：
// 我不告诉你
```

那不出意外，应该就能输出 `我不告诉你` 了，这个就是私有字段使用公共方法封装，能在私有字段传递给外界之前做一定的处理再传递

## 封装 get 和 set 方法

刚才有提过，私有字段理应使用方法来封装给外界传递，那么在面向对象的编程当中，每一个 Attribute 应该是私有字段，通过额外封装的 get 和 set 方法来修改/读取里面的值，所以我上面直接把字段设为 public 然后直接从外界修改是不规范的写法，正确的应该是这样，还是以 name 这个属性举例：

``` Java
public class Student {
    private String name;

    public void setName(String _name) {
      name = _name;
    }

    public String getName(){
      return name;
    }
}
```

这样才是规范的写法

那么这里聪明的你就要问了：为什么要多此一举呢？直接让 public 访问不好吗？那么，如果我说我们这样是为了安全呢？

比如你叫 Tom，你的妈妈已经在出生的时候给你取过名字了，后面不能让别人随便乱改名啊，所以我们就可以引入一个校验器

```Java
public class Student {
  private String name;

  public void setName(String _name){
    if(name.isEmpty()&&
       name.isNull()){
        name = _name
    } else {
      System.out.println("名字已被设置，不允许再设置");
    }
  }

  public String getName(){
    return name;
  }
}
```

我们改造了 `setName` 方法，这下只有在 Tom 没有被取过名字的情况下才能给他取名，比如我们先给他取了名字：

```Java
Student Tom = new Student();
Tom.setName("Tom");
```

但是当我想给他改名叫 Alex 的时候就会出现错误并拒绝

```Java
Tom.setName("Alex");
// 输出：
// 名字已被设置，不允许再设置
```

这个时候控制台就会输出 `名字已被设置，不允许再设置`，因为 name 这个私有变量已经不是空或者空字符串了，所以不允许再设置

这就是访问器的作用，AP 考试中会让你在 FRQ 的第二题手写一个类，这就会涉及到写访问器，千万不要直接给变量 public 了

本部分到此结束