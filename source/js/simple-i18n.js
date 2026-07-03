(function () {
  'use strict';

  const LANGUAGES = [
    { code: '', label: '简体中文 / Original', shortLabel: '简' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'ja', label: '日本語', shortLabel: 'JA' },
    { code: 'zh-TW', label: '繁體中文', shortLabel: '繁' },
    { code: 'ko', label: '한국어', shortLabel: 'KO' },
    { code: 'fr', label: 'Français', shortLabel: 'FR' },
    { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
    { code: 'es', label: 'Español', shortLabel: 'ES' },
    { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  ];

  const PAGE_LANGUAGE = 'zh-CN';
  const STORAGE_KEY = 'plfjy-i18n-lang';
  const SWITCHER_ID = 'plfjy-i18n-switcher';
  const ATTRIBUTION_ID = 'plfjy-i18n-attribution';
  const SELECT_ID = 'plfjy-i18n-select';
  const GOOGLE_ELEMENT_ID = 'google_translate_element';
  const GOOGLE_SCRIPT_ID = 'plfjy-google-translate-element-script';
  const BRAND_TRANSLATIONS = {
    default: 'Zero PLFJY',
    ja: 'ゼロ風PLFJY',
  };
  const ATTRIBUTION_LABELS = {
    default: '由 Google 翻译',
    en: 'Translated by Google',
    ja: 'Google 翻訳',
    'zh-TW': '由 Google 翻譯',
    ko: 'Google 번역',
    fr: 'Traduit par Google',
    de: 'Übersetzt von Google',
    es: 'Traducido por Google',
    ru: 'Переведено Google',
  };
  const ORIGINAL_SITE_TITLE = '零风PLFJYのBlog';
  const INCLUDED_LANGUAGES = LANGUAGES.map((lang) => lang.code)
    .filter(Boolean)
    .join(',');

  let googleScriptLoading = false;
  let googleElementInitialized = false;
  let observer = null;
  let bodyClassObserver = null;
  let mountTimer = null;
  let restoreTimer = null;
  let cleanupTimer = null;
  let spinnerTimer = null;
  let spinnerCleanupInterval = null;
  let textFixTimer = null;

  function getSavedLanguage() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function saveLanguage(lang) {
    try {
      if (lang) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
  }

  function isSupportedLanguage(lang) {
    return LANGUAGES.some((item) => item.code === lang);
  }

  function ensureGoogleElement() {
    let element = document.getElementById(GOOGLE_ELEMENT_ID);

    if (!element) {
      element = document.createElement('div');
      element.id = GOOGLE_ELEMENT_ID;
      element.setAttribute('translate', 'no');
      document.body.appendChild(element);
    }

    return element;
  }

  function markTypewriterAsNoTranslate() {
    document.querySelectorAll('#subtitle, #subtitle + .typed-cursor').forEach(function (element) {
      markNoTranslate(element);
    });

    const subtitle = document.getElementById('subtitle');
    const subtitleWrapper = subtitle && subtitle.closest('p');

    if (subtitleWrapper) {
      markNoTranslate(subtitleWrapper);
    }
  }

  function markCodeBlocksAsNoTranslate() {
    document
      .querySelectorAll(
        'pre, code, kbd, samp, figure.highlight, .highlight, .code, .gutter, .code-area, .markdown-body .highlight',
      )
      .forEach(markNoTranslate);
  }

  function isTranslationActive() {
    return Boolean(getSavedLanguage());
  }

  function getBrandTranslation() {
    return BRAND_TRANSLATIONS[getSavedLanguage()] || BRAND_TRANSLATIONS.default;
  }

  function getLocalizedSiteTitle() {
    if (!isTranslationActive()) return ORIGINAL_SITE_TITLE;

    if (getSavedLanguage() === 'ja') {
      return getBrandTranslation() + 'のBlog';
    }

    return getBrandTranslation() + "'s Blog";
  }

  function markNoTranslate(element) {
    if (!element) return;

    if (element.getAttribute('translate') !== 'no') {
      element.setAttribute('translate', 'no');
    }

    element.classList.add('notranslate', 'plfjy-i18n-no-translate');
  }

  function createAttribution() {
    const element = document.createElement('div');
    element.id = ATTRIBUTION_ID;
    element.className = 'plfjy-i18n-attribution';
    element.setAttribute('translate', 'no');
    element.classList.add('notranslate', 'plfjy-i18n-no-translate');

    const icon = document.createElement('i');
    icon.className = 'fa-brands fa-google plfjy-i18n-attribution-icon';
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'plfjy-i18n-attribution-text';
    text.textContent = '由 Google 翻译';

    element.appendChild(icon);
    element.appendChild(text);

    return element;
  }

  function getAttribution() {
    return document.getElementById(ATTRIBUTION_ID) || createAttribution();
  }

  function getAttributionLabel() {
    return ATTRIBUTION_LABELS[getSavedLanguage()] || ATTRIBUTION_LABELS.default;
  }

  function syncAttribution() {
    if (!document.body) return;

    const element = getAttribution();
    const text = element.querySelector('.plfjy-i18n-attribution-text');

    if (element.parentElement !== document.body) {
      document.body.appendChild(element);
    }

    if (text && text.textContent !== getAttributionLabel()) {
      text.textContent = getAttributionLabel();
    }

    element.classList.toggle('plfjy-i18n-attribution-active', isTranslationActive());
  }

  function syncLockedBrandTitles() {
    const title = getLocalizedSiteTitle();

    document.querySelectorAll('.logo-title').forEach(function (logoTitle) {
      const element = logoTitle.querySelector('h1') || logoTitle;

      markNoTranslate(element);

      if (element.textContent !== title) {
        element.textContent = title;
      }
    });

    document.querySelectorAll('.home-banner-container .description').forEach(function (element) {
      const subtitleWrapper = element.querySelector(':scope > p') || element.querySelector('p');
      const titleNodes = Array.from(element.childNodes).filter(function (node) {
        return node !== subtitleWrapper;
      });
      const isStable =
        titleNodes.length === 1 &&
        titleNodes[0].nodeType === Node.TEXT_NODE &&
        titleNodes[0].nodeValue === title &&
        (!subtitleWrapper || titleNodes[0].nextSibling === subtitleWrapper);

      markNoTranslate(element);

      if (isStable) return;

      Array.from(element.childNodes).forEach(function (node) {
        if (node !== subtitleWrapper) {
          node.parentNode.removeChild(node);
        }
      });

      if (!element.firstChild || element.firstChild !== subtitleWrapper) {
        element.insertBefore(document.createTextNode(title), subtitleWrapper || null);
      } else {
        element.insertBefore(document.createTextNode(title), subtitleWrapper);
      }
    });
  }

  function getTranslatedTextReplacements() {
    const savedLanguage = getSavedLanguage();
    const brand = getBrandTranslation();
    const blog = 'Blog';
    const siteTitle = getLocalizedSiteTitle();
    const replacements = [
      { from: /Zero\s+PLFJY's\s+Blog/g, to: siteTitle },
      { from: /Zero\s+PLFJY\s+Blog/g, to: siteTitle },
      { from: /Zero\s+PLFJY\s*の\s*(?:小站|Blog|ブログ)/g, to: siteTitle },
      { from: /ゼロ風\s*PLFJY\s*の\s*(?:小站|Blog|ブログ)/g, to: siteTitle },
      { from: /零风\s*PLFJY\s*の\s*(?:小站|Blog|ブログ)/g, to: siteTitle },
      { from: /Zero\s+PLFJY/g, to: brand },
      { from: /ゼロ風\s*PLFJY/g, to: brand },
      { from: /零风\s*PLFJY/g, to: brand },
      { from: /の\s*小站/g, to: ' ' + blog },
      { from: /の\s*Blog/g, to: ' ' + blog },
      { from: /小站/g, to: blog },
    ];

    if (savedLanguage === 'ja') {
      replacements.unshift(
        { from: /ゼロ\s*[風风]\s*PLFJY\s*の\s*(?:小站|Blog|ブログ)/g, to: siteTitle },
        { from: /ゼロ\s*[風风]\s*PLFJY\s*(?:Blog|ブログ|小站)/g, to: siteTitle },
        { from: /ゼロ\s*[風风]\s*PLFJY/g, to: brand },
        { from: /ゼロ\s*PLFJY\s*の\s*(?:小站|Blog|ブログ)/g, to: siteTitle },
        { from: /ゼロ\s*PLFJY\s*(?:ブログ|Blog|小站)/g, to: siteTitle },
        { from: /ゼロ\s*PLFJY/g, to: brand },
      );
      replacements.push({ from: /ゼロ風PLFJYBlog/g, to: siteTitle });
      replacements.push({ from: /ブログ/g, to: blog });
    }

    return replacements;
  }

  function fixTranslatedText(root) {
    syncLockedBrandTitles();

    if (!isTranslationActive()) return;

    const scope = root || document.body;
    const replacements = getTranslatedTextReplacements();

    if (!scope) return;

    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        const parent = node.parentElement;

        if (
          !parent ||
          parent.closest(
            'script, style, textarea, input, select, option, code, pre, .notranslate, .plfjy-i18n-no-translate, #' +
              SWITCHER_ID,
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return replacements.some((term) => {
          term.from.lastIndex = 0;
          return term.from.test(node.nodeValue);
        })
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(function (node) {
      let text = node.nodeValue;

      replacements.forEach(function (term) {
        term.from.lastIndex = 0;
        text = text.replace(term.from, term.to);
      });

      if (text !== node.nodeValue) {
        node.nodeValue = text;
      }
    });
  }

  function scheduleTranslatedTextFix() {
    if (!isTranslationActive()) return;

    [200, 800, 1800, 3500, 6000].forEach(function (delay) {
      window.setTimeout(function () {
        fixTranslatedText();
      }, delay);
    });
  }

  function debounceTranslatedTextFix() {
    if (!isTranslationActive()) return;

    window.clearTimeout(textFixTimer);
    textFixTimer = window.setTimeout(fixTranslatedText, 120);
  }

  function createSwitcher() {
    const switcher = document.createElement('div');
    const label = document.createElement('label');
    const select = document.createElement('select');
    const savedLanguage = getSavedLanguage();

    switcher.id = SWITCHER_ID;
    switcher.className = 'plfjy-i18n-switcher';
    switcher.setAttribute('translate', 'no');

    label.className = 'plfjy-i18n-label';
    label.setAttribute('for', SELECT_ID);
    label.innerHTML = '<i class="fa-solid fa-language"></i>';

    select.id = SELECT_ID;
    select.className = 'plfjy-i18n-select';
    select.setAttribute('aria-label', 'Select language');
    select.setAttribute('translate', 'no');

    LANGUAGES.forEach((lang) => {
      const option = document.createElement('option');
      option.value = lang.code;
      option.textContent = lang.label;
      option.dataset.label = lang.label;
      option.dataset.shortLabel = lang.shortLabel || '简';
      select.appendChild(option);
    });

    select.value = isSupportedLanguage(savedLanguage) ? savedLanguage : '';
    select.addEventListener('pointerdown', function () {
      updateOptionLabels(select, false);
    });
    select.addEventListener('focus', function () {
      updateOptionLabels(select, false);
    });
    select.addEventListener('blur', function () {
      window.setTimeout(mountSwitcher, 100);
    });
    select.addEventListener('change', function () {
      changeLanguage(select.value);
      window.setTimeout(mountSwitcher, 0);
    });

    switcher.appendChild(label);
    switcher.appendChild(select);

    return switcher;
  }

  function getSwitcher() {
    const existing = document.getElementById(SWITCHER_ID);
    return existing || createSwitcher();
  }

  function getDesktopTarget() {
    return (
      document.querySelector('.navbar-container .navbar-content .right .desktop') ||
      document.querySelector('.navbar-content .right .desktop')
    );
  }

  function getDrawerTarget() {
    return document.querySelector('.navbar-drawer .drawer-navbar-list') || document.querySelector('.navbar-drawer');
  }

  function getSideToolsTarget() {
    return document.querySelector('.right-side-tools-container .visible-tools-list');
  }

  function shouldUseDrawer() {
    return (
      document.body.classList.contains('navbar-drawer-show') ||
      (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
    );
  }

  function updateOptionLabels(select, compact) {
    if (!select) return;

    Array.from(select.options).forEach(function (option) {
      option.textContent = compact ? option.dataset.shortLabel || option.dataset.label : option.dataset.label;
    });
  }

  function mountSwitcher() {
    if (!document.body) return;

    markTypewriterAsNoTranslate();
    markCodeBlocksAsNoTranslate();
    syncLockedBrandTitles();
    ensureGoogleElement();

    const switcher = getSwitcher();
    const drawerTarget = getDrawerTarget();
    const sideToolsTarget = getSideToolsTarget();
    const useDrawer = shouldUseDrawer() && drawerTarget;
    const target = useDrawer ? drawerTarget : sideToolsTarget || document.body;
    const finalTarget = target || document.body;
    const isFloating = finalTarget === document.body;
    const isSideTool = finalTarget === sideToolsTarget;
    const isCompact = isSideTool || isFloating;

    switcher.classList.toggle('plfjy-i18n-floating', isFloating);
    switcher.classList.toggle('plfjy-i18n-drawer', finalTarget === drawerTarget);
    switcher.classList.toggle('plfjy-i18n-side-tool', isSideTool);
    switcher.classList.toggle('plfjy-i18n-compact', isCompact);
    switcher.classList.toggle('right-bottom-tools', isSideTool);
    switcher.classList.toggle('flex', isSideTool);
    switcher.classList.toggle('justify-center', isSideTool);
    switcher.classList.toggle('items-center', isSideTool);

    if (switcher.parentElement !== finalTarget) {
      if (isSideTool) {
        const scrollTopTool = finalTarget.querySelector('.tool-scroll-to-top');
        finalTarget.insertBefore(switcher, scrollTopTool || null);
      } else {
        finalTarget.appendChild(switcher);
      }
    }

    updateOptionLabels(switcher.querySelector('select'), isCompact);
    window.requestAnimationFrame(function () {
      updateOptionLabels(switcher.querySelector('select'), switcher.classList.contains('plfjy-i18n-compact'));
    });
    syncAttribution();
  }

  function scheduleMount() {
    window.clearTimeout(mountTimer);
    mountTimer = window.setTimeout(mountSwitcher, 250);
  }

  function hideGoogleChrome() {
    if (!document.body) return;

    document.body.style.top = '0px';
    document.documentElement.style.marginTop = '0px';

    document
      .querySelectorAll(
        'body > .skiptranslate, iframe.skiptranslate, .goog-te-banner-frame',
      )
      .forEach(function (element) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0';
      });
  }

  function scheduleGoogleChromeCleanup() {
    hideGoogleChrome();
    window.clearTimeout(cleanupTimer);
    cleanupTimer = window.setTimeout(hideGoogleChrome, 350);
  }

  function hideGoogleSpinner() {
    document
      .querySelectorAll("[class^='VIpgJd-ZVi9od-aZ2wEe'], [class*=' VIpgJd-ZVi9od-aZ2wEe']")
      .forEach(function (element) {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
      });
  }

  function scheduleGoogleSpinnerCleanup() {
    window.clearTimeout(spinnerTimer);
    window.clearInterval(spinnerCleanupInterval);
    hideGoogleSpinner();

    spinnerTimer = window.setTimeout(function () {
      const stopAt = Date.now() + 30000;

      hideGoogleSpinner();
      spinnerCleanupInterval = window.setInterval(function () {
        hideGoogleSpinner();

        if (Date.now() >= stopAt) {
          window.clearInterval(spinnerCleanupInterval);
          spinnerCleanupInterval = null;
        }
      }, 500);
    }, 4500);
  }

  function initGoogleTranslateElement() {
    ensureGoogleElement();

    if (googleElementInitialized) {
      restoreSavedLanguage();
      return;
    }

    if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
      return;
    }

    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: PAGE_LANGUAGE,
          includedLanguages: INCLUDED_LANGUAGES,
          autoDisplay: false,
        },
        GOOGLE_ELEMENT_ID,
      );
      googleElementInitialized = true;
      scheduleGoogleChromeCleanup();
      scheduleGoogleSpinnerCleanup();
      restoreSavedLanguage();
    } catch (_) {}
  }

  window.googleTranslateElementInit = initGoogleTranslateElement;

  function loadGoogleTranslate() {
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      initGoogleTranslateElement();
      return;
    }

    if (document.getElementById(GOOGLE_SCRIPT_ID) || googleScriptLoading) {
      return;
    }

    googleScriptLoading = true;

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = function () {
      googleScriptLoading = false;
    };

    document.head.appendChild(script);
  }

  function findGoogleComboWithRetry(callback, attempt) {
    const combo = document.querySelector('.goog-te-combo');
    const currentAttempt = attempt || 0;

    if (combo) {
      callback(combo);
      return;
    }

    if (currentAttempt >= 30) {
      return;
    }

    window.setTimeout(function () {
      findGoogleComboWithRetry(callback, currentAttempt + 1);
    }, 150);
  }

  function applyGoogleLanguage(lang) {
    if (!lang) return;

    loadGoogleTranslate();
    findGoogleComboWithRetry(function (combo) {
      if (combo.value === lang) {
        scheduleGoogleChromeCleanup();
        scheduleGoogleSpinnerCleanup();
        scheduleTranslatedTextFix();
        return;
      }

      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
      scheduleGoogleChromeCleanup();
      scheduleGoogleSpinnerCleanup();
      scheduleTranslatedTextFix();
    });
  }

  function clearGoogleTranslateCookies() {
    const expires = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';

    document.cookie = 'googtrans=; ' + expires + '; path=/';
    document.cookie = 'googtrans=; ' + expires + '; path=/; domain=.plfjy.top';
    document.cookie = 'googtrans=; ' + expires + '; path=/; domain=blog.plfjy.top';
  }

  function setGoogleTranslateCookie(lang) {
    const value = '/zh-CN/' + lang;

    document.cookie = 'googtrans=' + value + '; path=/';
    document.cookie = 'googtrans=' + value + '; path=/; domain=.plfjy.top';
    document.cookie = 'googtrans=' + value + '; path=/; domain=blog.plfjy.top';
  }

  function changeLanguage(lang) {
    if (!isSupportedLanguage(lang)) return;

    if (!lang) {
      saveLanguage('');
      clearGoogleTranslateCookies();
      window.location.reload();
      return;
    }

    saveLanguage(lang);
    setGoogleTranslateCookie(lang);
    applyGoogleLanguage(lang);
  }

  function restoreSavedLanguage() {
    const savedLanguage = getSavedLanguage();
    const select = document.getElementById(SELECT_ID);

    if (!savedLanguage || !isSupportedLanguage(savedLanguage)) {
      return;
    }

    if (select) {
      select.value = savedLanguage;
    }

    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(function () {
      applyGoogleLanguage(savedLanguage);
    }, 100);
  }

  function bindSwupEvents() {
    document.addEventListener('swup:contentReplaced', function () {
      markTypewriterAsNoTranslate();
      markCodeBlocksAsNoTranslate();
      syncLockedBrandTitles();
      scheduleMount();
      restoreSavedLanguage();
    });

    if (window.swup && typeof window.swup.on === 'function') {
      try {
        window.swup.on('contentReplaced', function () {
          markTypewriterAsNoTranslate();
          markCodeBlocksAsNoTranslate();
          syncLockedBrandTitles();
          scheduleMount();
          restoreSavedLanguage();
        });
      } catch (_) {}
    }
  }

  function observeDom() {
    if (observer || !document.body) return;

    observer = new MutationObserver(function () {
      hideGoogleSpinner();
      markTypewriterAsNoTranslate();
      markCodeBlocksAsNoTranslate();
      syncLockedBrandTitles();
      debounceTranslatedTextFix();
      scheduleMount();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    bodyClassObserver = new MutationObserver(function () {
      mountSwitcher();
    });
    bodyClassObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  function init() {
    markTypewriterAsNoTranslate();
    markCodeBlocksAsNoTranslate();
    syncLockedBrandTitles();
    mountSwitcher();

    if (getSavedLanguage()) {
      loadGoogleTranslate();
    }

    restoreSavedLanguage();
    bindSwupEvents();
    observeDom();
    hideGoogleChrome();

    window.addEventListener('resize', scheduleMount);
    document.addEventListener('click', scheduleMount, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.PLFJYSimpleI18n = {
    mountSwitcher: mountSwitcher,
    applyLanguage: changeLanguage,
  };
})();
