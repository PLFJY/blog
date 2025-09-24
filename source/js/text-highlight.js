// Markdown 高亮扩展支持脚本 (Hexo Redefine + Swup 专用版)
(function() {
  'use strict';

  // 配置选项
  const config = {
    markClass: 'mark-highlight', // 高亮元素的 class
    contentSelector: '.post-content', // Redefine 主题的文章容器
    skipTags: ['pre', 'code', 'script', 'style', 'textarea', 'noscript'] // 跳过处理的标签
  };

  // 处理单个文本节点
  function processTextNode(textNode) {
    const text = textNode.textContent;
    
    // 修复正则：确保边界匹配，避免误匹配 HTML 标签
    // (^|[^>=]) - 开头或非 > 和 = 的字符
    // == - 匹配标记
    // ([^=]+) - 中间内容（至少一个非=字符）
    // == - 闭合标记
    // ([^<]|$) - 结尾或非<字符
    const regex = /(^|[^>=])==([^=]+)==([^<]|$)/g;
    let match;
    let lastIndex = 0;
    const fragments = [];

    while ((match = regex.exec(text)) !== null) {
      // 添加匹配前的文本（注意：包含边界字符）
      if (match.index > lastIndex) {
        fragments.push(document.createTextNode(
          text.substring(lastIndex, match.index + match[1].length)
        ));
      }

      // 创建高亮元素
      const mark = document.createElement('mark');
      mark.className = config.markClass;
      mark.textContent = match[2];
      fragments.push(mark);

      // 更新最后匹配位置（减去结尾边界字符长度）
      lastIndex = match.index + match[0].length - match[3].length;
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      fragments.push(document.createTextNode(text.substring(lastIndex)));
    }

    // 如果有匹配项，替换原文本节点
    if (fragments.length > 0) {
      const parent = textNode.parentNode;
      fragments.forEach(fragment => {
        parent.insertBefore(fragment, textNode);
      });
      parent.removeChild(textNode);
      return true; // 标记已修改
    }
    return false;
  }

  // 检查是否应该跳过该节点
  function shouldSkip(node) {
    if (node.nodeType !== Node.TEXT_NODE) return true;
    
    let parent = node.parentNode;
    while (parent && parent.nodeType === Node.ELEMENT_NODE) {
      if (config.skipTags.includes(parent.tagName.toLowerCase())) {
        return true;
      }
      parent = parent.parentNode;
    }
    
    return false;
  }

  // 处理指定元素内的高亮
  function processHighlights(rootElement = document.body) {
    const target = rootElement.querySelector(config.contentSelector) || rootElement;
    
    // 使用 TreeWalker 高效遍历文本节点
    const walker = document.createTreeWalker(
      target,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          return shouldSkip(node) ? 
            NodeFilter.FILTER_REJECT : 
            NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    // 处理所有文本节点
    let modified = false;
    textNodes.forEach(node => {
      if (processTextNode(node)) modified = true;
    });
    
    return modified;
  }

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 初始化函数
  function initMarkdownHighlights() {
    // 立即处理当前页面
    processHighlights();
    
    // 处理 Swup 事件（兼容 2.x 和 3.x）
    if (typeof window.swup !== 'undefined') {
      const swup = window.swup;
      
      // Swup 3.x
      if (typeof swup.on === 'function') {
        swup.on('contentReplaced', debounce(() => {
          console.log('Swup 3.x: Replaced content - processing highlights');
          processHighlights();
        }, 100));
      } 
      // Swup 2.x
      else if (swup._handlers && swup._handlers.contentReplaced) {
        document.addEventListener('swup:contentReplaced', debounce(() => {
          console.log('Swup 2.x: Replaced content - processing highlights');
          processHighlights();
        }, 100));
      }
      
      // 额外保险：监听 DOM 变化
      new MutationObserver(debounce(mutations => {
        let shouldProcess = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            shouldProcess = true;
          }
        });
        if (shouldProcess) {
          console.log('DOM changed - processing highlights');
          processHighlights();
        }
      }, 100)).observe(document.querySelector('.swup') || document.body, {
        childList: true,
        subtree: true
      });
    }

    // 暴露全局 API 便于调试
    window.markdownHighlights = {
      process: processHighlights,
      refresh: initMarkdownHighlights
    };
  }

  // 页面加载时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarkdownHighlights);
  } else {
    initMarkdownHighlights();
  }

  // 调试辅助：在控制台输入 markdownHighlights.process() 可手动触发
  console.log('Markdown highlight script loaded. Use markdownHighlights.process() to refresh.');
})();