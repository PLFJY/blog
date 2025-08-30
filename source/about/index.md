---
title: 关于我
date: 2025-07-19 04:41:09
---

```c#
///<summary>
///个人简介
///</summary>
public class 零风PLFJY : 男生
{
    public int 出生年份 {get; } = 2008;

    public Sign 星座 {get; } = Sign.天秤座;

    public MBTI MBTI {get; } = MBTI.INTP;

    public string[] 主推 {get; private set; }= ["星野爱", "YOASOBI", "梦之女巫", ".NET", "WPF", "C#", "Fluent UI"];

    public string[] 游戏🎮 {get; private set; } = ["第五人格", "Minecraft", "原神", "千恋万花"];  //只列了最喜欢的
    
    public string[] 音乐🎵 {get; private set; } = ["YOASOBI", "ボカロ", "中V", "J-POP", "EDM"];
    
    public List<string> 看的番 {get; } = ["推子", "青猪", "春物", "超电磁炮","莉可丽丝", "轻音", "紫罗兰", "CL", "败犬女主", "弹丸", "樱花庄", "魔圆", "邻家天使", "龙与虎", "中二病", "约战", "五等分", "芙莉莲"]; //此处省略 (70-看的番.Count) 项，恋爱番居多

    public List<string> 想要/正在学习 {get; } = ["雅思", "C/C++", "JAVA", "HTML", "CSS", "Javascript", "SQL", "Rust", "Blazor", "Avalonia", "Tauri",]; 

    public string[] 雷点 {get;  private set; } = ["内娱、韩娱太重"];

    public 零风PLFJY()
    {
        Console.WriteLine("Hello World!");
        //社交账号
        Console.WriteLine("BiliBili: 零风PLFJY");
        Console.WriteLine("QQ: 3424127335");
        Console.WriteLine("E-Mail: zero_plfjy@outlook.com");
        Console.WriteLine("GitHub: https://github.com/PLFJY");
        //个人网站
        Console.WriteLine("主页: https://plfjy.top/");
        Console.WriteLine("博客: https://blog.plfjy.top/");
    }
}
```

