# 零风PLFJY的博客

框架：Hexo

主题：Redefine

## 环境：

Node.js

```shell
npm install -g hexo-cli #安装Hexo CLI
npm install #安装博客框架本身的依赖
```

## 用法

### 创建新文章：

```shell
hexo new <passage-name>
```

### 创建新页面：

```shell
hexo new page <page-name>
```

## 部署：

### 作为服务器：

```shell
hexo clean
hexo g
hexo server
```

或者 powershell 上

```powershell
.\server.ps1
```

### 到Github

```shell
git add .
git commit -m "<Message>"
git push
```

或者 powershell 上

```bat
.\push.bat
```

