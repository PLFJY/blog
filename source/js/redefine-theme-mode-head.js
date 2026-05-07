(function () {
  'use strict';

  const MODE_KEY = 'PLFJY-THEME-MODE';
  const REDEFINE_KEY = 'REDEFINE-THEME-STATUS';
  const MODES = new Set(['system', 'light', 'dark']);

  function getMode() {
    try {
      const mode = localStorage.getItem(MODE_KEY);
      return MODES.has(mode) ? mode : 'system';
    } catch (_) {
      return 'system';
    }
  }

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;

    if (body) {
      body.classList.remove('light-mode', 'dark-mode');
      body.classList.add(`${theme}-mode`);
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.body) return;
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(`${theme}-mode`);
      observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function writeRedefineStatus(theme) {
    try {
      let status = {};
      const raw = localStorage.getItem(REDEFINE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') status = parsed;
      }
      status.isDark = theme === 'dark';
      localStorage.setItem(REDEFINE_KEY, JSON.stringify(status));
    } catch (_) {}
  }

  const mode = getMode();
  const effectiveTheme = mode === 'system' ? getSystemTheme() : mode;

  if (mode === 'system') {
    try {
      localStorage.removeItem(REDEFINE_KEY);
    } catch (_) {}
  } else {
    writeRedefineStatus(effectiveTheme);
  }

  applyTheme(effectiveTheme);
})();