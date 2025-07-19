---
title: Hexo插入图片踩坑记录
date: 2025-07-19 03:02:14
tags: 
- Hexo
categories:
- Hexo
---

总算是配置好博客了，这个图片问题搞了我半个小时，现在终于搞定了，本来就不麻烦，其实站在巨人的肩膀上就好了，这样能保证Typora / VS Code编辑本地预览有效通知网页上也预览没问题
`_config.yml`

```yml
post_asset_folder: true
marked:
  prependRoot: true
  postAsset: true
```
```shell
npm install hexo-asset-img --save
```
这里贴一下大佬的仓库：[yiyungent/hexo-asset-img](https://github.com/yiyungent/hexo-asset-img)
引用图片的时候像这样

```markdown
![](<assets_folder_name>/<file_name>.jpg)
```
完事