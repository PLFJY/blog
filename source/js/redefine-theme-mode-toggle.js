(function () {
  'use strict';

  const MODE_KEY = 'PLFJY-THEME-MODE';
  const REDEFINE_KEY = 'REDEFINE-THEME-STATUS';
  const MODES = ['system', 'light', 'dark'];

  const ICONS = {
    system: 'fa-solid fa-circle-half-stroke',
    light: 'fa-regular fa-brightness',
    dark: 'fa-regular fa-moon',
  };

  const LABELS = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getMode() {
    try {
      const mode = localStorage.getItem(MODE_KEY);
      return MODES.includes(mode) ? mode : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function setMode(mode) {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch (_) {}
  }

  function getEffectiveTheme(mode) {
    return mode === 'system' ? getSystemTheme() : mode;
  }

  function readRedefineStatus() {
    try {
      const raw = localStorage.getItem(REDEFINE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeRedefineStatus(theme) {
    try {
      const status = readRedefineStatus();
      status.isDark = theme === 'dark';
      localStorage.setItem(REDEFINE_KEY, JSON.stringify(status));
    } catch (_) {}
  }

  function clearRedefineStatus() {
    try {
      localStorage.removeItem(REDEFINE_KEY);
    } catch (_) {}
  }

  function applyClasses(theme) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;

    if (document.body) {
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(`${theme}-mode`);
    }
  }

  function updateGiscus(theme) {
    const frame = document.querySelector('iframe.giscus-frame');
    if (!frame || !frame.contentWindow) return;

    frame.contentWindow.postMessage(
      {
        giscus: {
          setConfig: {
            theme,
          },
        },
      },
      'https://giscus.app',
    );
  }

  function updateUtterances(theme) {
    const frame = document.querySelector('iframe.utterances-frame');
    if (!frame || !frame.contentWindow) return;

    const container = document.querySelector('#utterances-container');
    const lightTheme =
      container?.dataset?.utterancesThemeLight || 'github-light';
    const darkTheme =
      container?.dataset?.utterancesThemeDark || 'github-dark';

    frame.contentWindow.postMessage(
      {
        type: 'set-theme',
        theme: theme === 'dark' ? darkTheme : lightTheme,
      },
      'https://utteranc.es',
    );
  }

  function updateMermaid(themeName) {
    if (!window.mermaid) return;

    const selector = '.mermaid';
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;

    nodes.forEach((node) => {
      if (!node.getAttribute('data-original-code')) {
        node.setAttribute('data-original-code', node.innerHTML);
      }

      const original = node.getAttribute('data-original-code');
      node.removeAttribute('data-processed');
      node.innerHTML = original;
    });

    const mermaidThemeConfig =
      window.theme?.plugins?.mermaid?.theme ||
      window.theme?.mermaid?.style ||
      {};

    const mermaidTheme =
      themeName === 'dark'
        ? mermaidThemeConfig.dark || 'dark'
        : mermaidThemeConfig.light || 'default';

    try {
      window.mermaid.initialize({ theme: mermaidTheme });
      window.mermaid.init({ theme: mermaidTheme }, nodes);
    } catch (_) {}
  }

  function updateButton(mode) {
    const button = document.querySelector('.tool-dark-light-toggle');
    if (!button) return;

    const icon = button.querySelector('i');
    if (icon) {
      icon.className = ICONS[mode] || ICONS.system;
    }

    const currentLabel = LABELS[mode];
    const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    const nextLabel = LABELS[nextMode];

    button.dataset.themeMode = mode;
    button.dataset.themeLabel = currentLabel;
    button.title = `Theme: ${currentLabel}. Click to switch to ${nextLabel}.`;
    button.setAttribute(
      'aria-label',
      `Current theme mode: ${currentLabel}. Switch to ${nextLabel}.`,
    );
  }

  function applyMode(mode, options = {}) {
    const { persist = true, updateIntegrations = true } = options;
    const effectiveTheme = getEffectiveTheme(mode);

    if (persist) {
      setMode(mode);
    }

    if (mode === 'system') {
      clearRedefineStatus();
    } else {
      writeRedefineStatus(effectiveTheme);
    }

    applyClasses(effectiveTheme);
    updateButton(mode);

    document.documentElement.dataset.themeMode = mode;
    document.documentElement.dataset.effectiveTheme = effectiveTheme;

    if (updateIntegrations) {
      updateGiscus(effectiveTheme);
      updateUtterances(effectiveTheme);
      updateMermaid(effectiveTheme);
    }
  }

  function getNextMode(mode) {
    const index = MODES.indexOf(mode);
    return MODES[(index + 1) % MODES.length];
  }

  document.addEventListener(
    'click',
    function (event) {
      const button = event.target.closest?.('.tool-dark-light-toggle');
      if (!button) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const nextMode = getNextMode(getMode());
      applyMode(nextMode);
    },
    true,
  );

  function refreshAfterRedefine() {
    window.setTimeout(() => {
      applyMode(getMode(), {
        persist: false,
        updateIntegrations: false,
      });
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshAfterRedefine);
  } else {
    refreshAfterRedefine();
  }

  document.addEventListener('swup:contentReplaced', refreshAfterRedefine);
  window.addEventListener('redefine:page:refresh', refreshAfterRedefine);

  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (media) {
    media.addEventListener('change', () => {
      window.setTimeout(() => {
        const mode = getMode();
        applyMode(mode, {
          persist: false,
          updateIntegrations: true,
        });
      }, 0);
    });
  }

  const observer = new MutationObserver(() => {
    updateButton(getMode());
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.__PLFJYThemeMode = {
    getMode,
    applyMode,
  };
})();