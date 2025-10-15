(function () {
  'use strict';

  // 要跳过的标签（不在这些标签内进行替换）
  const SKIP_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA']);

  // 非贪婪匹配 ==...==，允许跨空格和特殊字符
  const MARK_RE = /==([\s\S]+?)==/g;

  // 判断节点是否在我们需要跳过的标签内
  function isInsideSkippedTag(node) {
    while (node) {
      if (node.nodeType === 1 && SKIP_TAGS.has(node.tagName)) return true;
      node = node.parentNode;
    }
    return false;
  }

  // 将单个文本节点里的所有 ==...== 替换为 <mark>...</mark>
  function replaceInTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!text || text.indexOf('==') === -1) return;

    MARK_RE.lastIndex = 0;
    let match;
    let lastIndex = 0;
    const frag = document.createDocumentFragment();

    while ((match = MARK_RE.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) frag.appendChild(document.createTextNode(before));

      const mark = document.createElement('mark');
      // 只设置 textContent，保持 HTML 安全
      mark.textContent = match[1];
      frag.appendChild(mark);

      lastIndex = MARK_RE.lastIndex;
    }

    const after = text.slice(lastIndex);
    if (after) frag.appendChild(document.createTextNode(after));

    // 用片段替换原文本节点
    textNode.parentNode.replaceChild(frag, textNode);
  }

  // 在 root 上处理所有可见文本节点
  function process(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        if (node.nodeValue.indexOf('==') === -1) return NodeFilter.FILTER_REJECT;
        // 如果仅包含空白（回车空格），跳过
        if (node.nodeValue.trim() === '') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }, false);

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const n of nodes) {
      // 跳过 code/pre 等
      if (!isInsideSkippedTag(n.parentNode)) {
        replaceInTextNode(n);
      }
    }
  }

  // 在初次加载时运行一次
  function onReadyRun() {
    process();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReadyRun);
  } else {
    onReadyRun();
  }

  // swup 支持：
  // 1) 如果存在全局 swup 实例并且有 on 方法，使用它
  // 2) 兼容 swup 自定义 DOM 事件（document 上的 'swup:contentReplaced'）
  if (window.swup && typeof window.swup.on === 'function') {
    try { window.swup.on('contentReplaced', () => process()); } catch (e) { /* ignore */ }
  }
  document.addEventListener('swup:contentReplaced', () => process());

  // 兜底：监听 DOM 的新插入（节流）
  let idleTimer = null;
  const observer = new MutationObserver(() => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      process();
      idleTimer = null;
    }, 60);
  });
  // 观察整个文档的子节点变化（轻量级配置）
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // 可选：暴露一个手动触发的函数，方便调试 / 在控制台直接调用
  window.__applyDoubleEqualsMark = process;

})();
