(function () {
  'use strict';

  const SETTINGS = {
    languages: [
      {
        code: 'zh-CN',
        label: '中文',
        shortLabel: '中',
        prefix: 'zh-CN',
      },
      {
        code: 'en',
        label: 'English',
        shortLabel: 'EN',
        prefix: 'en',
      },
    ],

    // 如果 window.config.language 读不到，就用这个兜底
    fallbackDefaultLanguage: 'zh-CN',

    // false = 默认语言不加前缀，例如 /about/
    // true  = 所有语言都加前缀，例如 /zh-CN/about/
    prefixDefaultLanguage: false,

    // 可选：后续你如果生成 /i18n-map.json，它会优先按 map 跳转
    manifestUrl: '/i18n-map.json',

    storageKey: 'PLFJY-I18N-LANGUAGE',
  };

  const LANG_CODES = SETTINGS.languages.map((lang) => lang.code);
  const LANG_PREFIXES = SETTINGS.languages.map((lang) => lang.prefix);

  let cachedManifest = null;
  let manifestLoaded = false;
  let pendingTimer = null;

  function normalizeRoot(root) {
    if (!root || root === '/') return '/';
    return `/${String(root).replace(/^\/+|\/+$/g, '')}/`;
  }

  function getRoot() {
    return normalizeRoot(window.config && window.config.root);
  }

  function trimSlashes(value) {
    return String(value || '').replace(/^\/+|\/+$/g, '');
  }

  function ensureLeadingSlash(path) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  function withQueryAndHash(path) {
    return path + window.location.search + window.location.hash;
  }

  function getDefaultLanguage() {
    const configured = window.config && window.config.language;
    const first = Array.isArray(configured) ? configured[0] : configured;

    if (LANG_CODES.includes(first)) {
      return first;
    }

    return SETTINGS.fallbackDefaultLanguage;
  }

  function getLangByPrefix(prefix) {
    return SETTINGS.languages.find((lang) => lang.prefix === prefix) || null;
  }

  function getLangConfig(code) {
    return SETTINGS.languages.find((lang) => lang.code === code) || null;
  }

  function getPathWithoutRoot() {
    const root = getRoot();
    let pathname = decodeURI(window.location.pathname);

    if (root !== '/' && pathname.startsWith(root)) {
      pathname = pathname.slice(root.length);
    } else {
      pathname = pathname.replace(/^\/+/, '');
    }

    return pathname.replace(/^\/+/, '');
  }

  function splitLanguagePrefix(pathWithoutRoot) {
    const cleanPath = pathWithoutRoot.replace(/^\/+/, '');
    const parts = cleanPath.split('/').filter(Boolean);
    const firstPart = parts[0];

    if (LANG_PREFIXES.includes(firstPart)) {
      const lang = getLangByPrefix(firstPart);
      return {
        langCode: lang.code,
        canonicalPath: parts.slice(1).join('/'),
      };
    }

    return {
      langCode: getDefaultLanguage(),
      canonicalPath: cleanPath,
    };
  }

  function getCurrentLanguage() {
    return splitLanguagePrefix(getPathWithoutRoot()).langCode;
  }

  function getCanonicalPath() {
    return splitLanguagePrefix(getPathWithoutRoot()).canonicalPath;
  }

  function buildFallbackUrl(targetLangCode) {
    const root = getRoot();
    const defaultLang = getDefaultLanguage();
    const target = getLangConfig(targetLangCode);
    const canonicalPath = trimSlashes(getCanonicalPath());

    if (!target) {
      return withQueryAndHash(window.location.pathname);
    }

    const shouldPrefix =
      SETTINGS.prefixDefaultLanguage || targetLangCode !== defaultLang;

    let finalPath;

    if (shouldPrefix) {
      finalPath = `${root}${target.prefix}/${canonicalPath}`;
    } else {
      finalPath = `${root}${canonicalPath}`;
    }

    finalPath = finalPath.replace(/\/{2,}/g, '/');

    if (!finalPath.endsWith('/')) {
      finalPath += '/';
    }

    return withQueryAndHash(finalPath);
  }

  function normalizeManifestPath(path) {
    if (!path) return '/';

    try {
      path = new URL(path, window.location.origin).pathname;
    } catch (_) {}

    path = decodeURI(path);
    path = ensureLeadingSlash(path);

    if (!path.endsWith('/')) {
      path += '/';
    }

    return path;
  }

  function getManifestTarget(targetLangCode) {
    if (!cachedManifest || typeof cachedManifest !== 'object') {
      return null;
    }

    const currentCandidates = [
      window.location.pathname,
      normalizeManifestPath(window.location.pathname),
      normalizeManifestPath(getPathWithoutRoot()),
      normalizeManifestPath(getCanonicalPath()),
    ];

    for (const candidate of currentCandidates) {
      const entry = cachedManifest[candidate];

      if (entry && entry[targetLangCode]) {
        return withQueryAndHash(normalizeManifestPath(entry[targetLangCode]));
      }
    }

    return null;
  }

  function getTargetUrl(targetLangCode) {
    return getManifestTarget(targetLangCode) || buildFallbackUrl(targetLangCode);
  }

  async function loadManifestOnce() {
    if (manifestLoaded) return;

    manifestLoaded = true;

    try {
      const response = await fetch(SETTINGS.manifestUrl, {
        cache: 'no-store',
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data && typeof data === 'object') {
        cachedManifest = data;
      }
    } catch (_) {
      // 没有 manifest 也没关系，走路径前缀 fallback
    }
  }

  function injectStyle() {
    if (document.getElementById('plfjy-i18n-switcher-style')) return;

    const style = document.createElement('style');
    style.id = 'plfjy-i18n-switcher-style';

    style.textContent = `
      .navbar-content .right .desktop .navbar-list {
        gap: 18px;
      }

      .navbar-content .right .desktop .navbar-list .navbar-item.search {
        margin-left: 4px;
      }

      .plfjy-i18n-switcher {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8px;
        color: var(--default-text-color);
        z-index: 10;
      }

      .plfjy-i18n-button {
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--default-text-color);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 5px 4px;
        font: inherit;
        line-height: 1;
      }

      .plfjy-i18n-button i {
        color: var(--default-text-color);
      }

      .plfjy-i18n-current {
        font-size: 0.9rem;
        font-weight: 600;
        transform: translateY(0.5px);
      }

      .plfjy-i18n-chevron {
        font-size: 0.7rem;
        transition: transform 0.2s ease;
      }

      .plfjy-i18n-switcher.is-open .plfjy-i18n-chevron {
        transform: rotate(180deg);
      }

      .plfjy-i18n-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 128px;
        margin: 0;
        padding: 6px;
        list-style: none;
        border-radius: 12px;
        background: rgb(from var(--background-color) r g b / 78%);
        border: 1px solid var(--border-color);
        box-shadow: 0 8px 30px rgb(0 0 0 / 12%);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-6px);
        transition:
          opacity 0.18s ease,
          transform 0.18s ease,
          visibility 0.18s ease;
      }

      .plfjy-i18n-switcher.is-open .plfjy-i18n-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .plfjy-i18n-menu a {
        display: flex !important;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 10px !important;
        border-radius: 8px;
        white-space: nowrap;
        color: var(--default-text-color) !important;
        text-decoration: none;
        font-size: 0.95rem;
      }

      .plfjy-i18n-menu a:hover {
        color: var(--primary-color) !important;
        background: var(--third-background-color);
      }

      .plfjy-i18n-menu a.is-current {
        color: var(--primary-color) !important;
        font-weight: 700;
        pointer-events: none;
      }

      .plfjy-i18n-menu a::after {
        display: none !important;
      }

      .plfjy-i18n-mobile {
        position: relative;
      }

      .plfjy-i18n-mobile .plfjy-i18n-button {
        width: 20px;
        height: 20px;
        padding: 0;
      }

      .plfjy-i18n-mobile .plfjy-i18n-current,
      .plfjy-i18n-mobile .plfjy-i18n-chevron {
        display: none;
      }

      .plfjy-i18n-mobile .plfjy-i18n-menu {
        top: calc(100% + 14px);
        right: -42px;
      }

      .navbar-content.transition-navbar.has-home-banner .right .desktop .plfjy-i18n-button,
      .navbar-content.transition-navbar.has-home-banner .right .desktop .plfjy-i18n-button i,
      .navbar-content.transition-navbar.has-home-banner .right .mobile .plfjy-i18n-button,
      .navbar-content.transition-navbar.has-home-banner .right .mobile .plfjy-i18n-button i {
        color: #fff !important;
        text-shadow: #000 1px 1px 10px;
      }

      .navbar-content.transition-navbar.has-home-banner .right .desktop .plfjy-i18n-menu a,
      .navbar-content.transition-navbar.has-home-banner .right .mobile .plfjy-i18n-menu a {
        text-shadow: none;
      }

      @media (max-width: 1024px) {
        .plfjy-i18n-switcher {
          margin-left: 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function createSwitcherElement({ mobile = false } = {}) {
    const currentLang = getCurrentLanguage();

    const wrapper = document.createElement(mobile ? 'div' : 'li');
    wrapper.className = mobile
      ? 'icon-item plfjy-i18n-switcher plfjy-i18n-mobile'
      : 'navbar-item plfjy-i18n-switcher';

    wrapper.setAttribute('data-current-lang', currentLang);

    const currentConfig = getLangConfig(currentLang);
    const currentLabel = currentConfig ? currentConfig.shortLabel : currentLang;

    wrapper.innerHTML = `
      <button class="plfjy-i18n-button" type="button" aria-haspopup="true" aria-expanded="false" title="Switch language">
        <i class="fa-solid fa-language"></i>
        <span class="plfjy-i18n-current">${currentLabel}</span>
        <i class="fa-solid fa-chevron-down plfjy-i18n-chevron"></i>
      </button>
      <ul class="plfjy-i18n-menu"></ul>
    `;

    const button = wrapper.querySelector('.plfjy-i18n-button');
    const menu = wrapper.querySelector('.plfjy-i18n-menu');

    SETTINGS.languages.forEach((lang) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const isCurrent = lang.code === currentLang;

      link.href = getTargetUrl(lang.code);
      link.dataset.lang = lang.code;
      link.className = isCurrent ? 'is-current' : '';
      link.innerHTML = `
        <span>${lang.label}</span>
        ${isCurrent ? '<i class="fa-solid fa-check"></i>' : ''}
      `;

      link.addEventListener('click', () => {
        try {
          localStorage.setItem(SETTINGS.storageKey, lang.code);
        } catch (_) {}
      });

      item.appendChild(link);
      menu.appendChild(item);
    });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      closeAllSwitchers(wrapper);

      const isOpen = wrapper.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });

    return wrapper;
  }

  function closeAllSwitchers(except) {
    document
      .querySelectorAll('.plfjy-i18n-switcher.is-open')
      .forEach((switcher) => {
        if (switcher === except) return;

        switcher.classList.remove('is-open');
        const button = switcher.querySelector('.plfjy-i18n-button');
        if (button) {
          button.setAttribute('aria-expanded', 'false');
        }
      });
  }

  function removeOldSwitchers(scope) {
    scope
      .querySelectorAll('.plfjy-i18n-switcher')
      .forEach((node) => node.remove());
  }

  function injectDesktopSwitcher() {
    const navbarList = document.querySelector(
      '.navbar-content .right .desktop .navbar-list',
    );

    if (!navbarList) return;

    removeOldSwitchers(navbarList);

    const switcher = createSwitcherElement({ mobile: false });
    const searchItem = navbarList.querySelector(
      '.navbar-item.search.search-popup-trigger',
    );

    if (searchItem) {
      navbarList.insertBefore(switcher, searchItem);
    } else {
      navbarList.appendChild(switcher);
    }
  }

  function injectMobileSwitcher() {
    const mobileNavbar = document.querySelector('.navbar-content .right .mobile');

    if (!mobileNavbar) return;

    removeOldSwitchers(mobileNavbar);

    const switcher = createSwitcherElement({ mobile: true });
    const searchItem = mobileNavbar.querySelector(
      '.icon-item.search.search-popup-trigger',
    );
    const menuButton = mobileNavbar.querySelector('.icon-item.navbar-bar');

    if (searchItem) {
      mobileNavbar.insertBefore(switcher, searchItem);
    } else if (menuButton) {
      mobileNavbar.insertBefore(switcher, menuButton);
    } else {
      mobileNavbar.appendChild(switcher);
    }
  }

  function refreshSwitcher() {
    injectStyle();
    injectDesktopSwitcher();
    injectMobileSwitcher();
  }

  function scheduleRefresh() {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
    }

    pendingTimer = setTimeout(() => {
      refreshSwitcher();
      pendingTimer = null;
    }, 60);
  }

  function init() {
    refreshSwitcher();

    loadManifestOnce().then(() => {
      refreshSwitcher();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('click', () => {
    closeAllSwitchers();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllSwitchers();
    }
  });

  document.addEventListener('swup:contentReplaced', init);
  window.addEventListener('redefine:page:refresh', init);
  window.addEventListener('popstate', init);

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();