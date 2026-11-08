(()=>{let o={languages:[{code:"zh-CN",label:"中文",shortLabel:"中",prefix:"zh-CN"},{code:"en",label:"English",shortLabel:"EN",prefix:"en"}],fallbackDefaultLanguage:"zh-CN",prefixDefaultLanguage:!1,manifestUrl:"/i18n-map.json",storageKey:"PLFJY-I18N-LANGUAGE"},n=o.languages.map(e=>e.code),i=o.languages.map(e=>e.prefix),a=null,t=!1,e=null;function l(){return(e=window.config&&window.config.root)&&"/"!==e?`/${String(e).replace(/^\/+|\/+$/g,"")}/`:"/";var e}function c(e){return e+window.location.search+window.location.hash}function s(){var e=window.config&&window.config.language,e=Array.isArray(e)?e[0]:e;return n.includes(e)?e:o.fallbackDefaultLanguage}function p(n){return o.languages.find(e=>e.code===n)||null}function d(){var e=l();let n=decodeURI(window.location.pathname);return(n="/"!==e&&n.startsWith(e)?n.slice(e.length):n.replace(/^\/+/,"")).replace(/^\/+/,"")}function u(e){var n,e=e.replace(/^\/+/,""),t=e.split("/").filter(Boolean),a=t[0];return i.includes(a)?(n=a,{langCode:(o.languages.find(e=>e.prefix===n)||null).code,canonicalPath:t.slice(1).join("/")}):{langCode:s(),canonicalPath:e}}function f(){return u(d()).canonicalPath}function r(e){var n=l(),t=s(),a=p(e),i=(i=f(),String(i||"").replace(/^\/+|\/+$/g,""));if(!a)return c(window.location.pathname);e=o.prefixDefaultLanguage||e!==t;let r;return(r=(r=e?""+n+a.prefix+"/"+i:""+n+i).replace(/\/{2,}/g,"/")).endsWith("/")||(r+="/"),c(r)}function h(e){if(!e)return"/";try{e=new URL(e,window.location.origin).pathname}catch(e){}var n;return e=decodeURI(e),(e=(n=e).startsWith("/")?n:"/"+n).endsWith("/")||(e+="/"),e}function m(e){return(e=>{var n;if(a&&"object"==typeof a)for(n of[window.location.pathname,h(window.location.pathname),h(d()),h(f())]){var t=a[n];if(t&&t[e])return c(h(t[e]))}return null})(e)||r(e)}function b({mobile:e=!1}={}){let i=u(d()).langCode,n=document.createElement(e?"div":"li");n.className=e?"icon-item plfjy-i18n-switcher plfjy-i18n-mobile":"navbar-item plfjy-i18n-switcher",n.setAttribute("data-current-lang",i);e=p(i),e=e?e.shortLabel:i;n.innerHTML=`
      <button class="plfjy-i18n-button" type="button" aria-haspopup="true" aria-expanded="false" title="Switch language">
        <i class="fa-solid fa-language"></i>
        <span class="plfjy-i18n-current">${e}</span>
        <i class="fa-solid fa-chevron-down plfjy-i18n-chevron"></i>
      </button>
      <ul class="plfjy-i18n-menu"></ul>
    `;let t=n.querySelector(".plfjy-i18n-button"),r=n.querySelector(".plfjy-i18n-menu");return o.languages.forEach(e=>{var n=document.createElement("li"),t=document.createElement("a"),a=e.code===i;t.href=m(e.code),t.dataset.lang=e.code,t.className=a?"is-current":"",t.innerHTML=`
        <span>${e.label}</span>
        ${a?'<i class="fa-solid fa-check"></i>':""}
      `,t.addEventListener("click",()=>{try{localStorage.setItem(o.storageKey,e.code)}catch(e){}}),n.appendChild(t),r.appendChild(n)}),t.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),g(n);e=n.classList.toggle("is-open");t.setAttribute("aria-expanded",String(e))}),n}function g(n){document.querySelectorAll(".plfjy-i18n-switcher.is-open").forEach(e=>{e!==n&&(e.classList.remove("is-open"),e=e.querySelector(".plfjy-i18n-button"))&&e.setAttribute("aria-expanded","false")})}function y(e){e.querySelectorAll(".plfjy-i18n-switcher").forEach(e=>e.remove())}function v(){var e,n,t,a,i;document.getElementById("plfjy-i18n-switcher-style")||((e=document.createElement("style")).id="plfjy-i18n-switcher-style",e.textContent=`
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
    `,document.head.appendChild(e)),(e=document.querySelector(".navbar-content .right .desktop .navbar-list"))&&(y(e),n=b({mobile:!1}),(i=e.querySelector(".navbar-item.search.search-popup-trigger"))?e.insertBefore(n,i):e.appendChild(n)),(i=document.querySelector(".navbar-content .right .mobile"))&&(y(i),n=b({mobile:!0}),t=i.querySelector(".icon-item.search.search-popup-trigger"),a=i.querySelector(".icon-item.navbar-bar"),t?i.insertBefore(n,t):a?i.insertBefore(n,a):i.appendChild(n))}function w(){v(),(async()=>{if(!t){t=!0;try{var e,n=await fetch(o.manifestUrl,{cache:"no-store"});n.ok&&(e=await n.json())&&"object"==typeof e&&(a=e)}catch(e){}}})().then(()=>{v()})}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",w):w(),document.addEventListener("click",()=>{g()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&g()}),document.addEventListener("swup:contentReplaced",w),window.addEventListener("redefine:page:refresh",w),window.addEventListener("popstate",w),new MutationObserver(function(){e&&clearTimeout(e),e=setTimeout(()=>{v(),e=null},60)}).observe(document.documentElement,{childList:!0,subtree:!0})})();