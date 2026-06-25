(()=>{let a="https://t.alcy.cc/moez",t=[{selector:".home-banner-container .social-contacts",name:"home-social",pauseWhenInactive:!1,baseAlpha:.62,effectAlpha:1},{selector:".search-pop-overlay .search-popup",name:"search-popup",pauseWhenInactive:!0,baseAlpha:.62,effectAlpha:1,isActive(e){e=e.closest(".search-pop-overlay");return!!e&&e.classList.contains("active")}}],o={blink:96,gecko:96,webkit:15};function i(){var e=(()=>{var t=navigator.userAgent||"";if(/iPad|iPhone|iPod/.test(t)){let e=t.match(/Version\/(\d+(?:\.\d+)?)/);var o=t.match(/OS (\d+)_/);return{engine:"webkit",browser:"ios-webkit",version:Number(e&&e[1]||o&&o[1]||0)}}if(o=t.match(/Firefox\/(\d+(?:\.\d+)?)/))return{engine:"gecko",browser:"firefox",version:Number(o[1])};if(o=t.match(/Edg\/(\d+(?:\.\d+)?)/))return{engine:"blink",browser:"edge",version:Number(o[1])};if(o=t.match(/OPR\/(\d+(?:\.\d+)?)/))return{engine:"blink",browser:"opera",version:Number(o[1])};if(o=t.match(/Chrome\/(\d+(?:\.\d+)?)/))return{engine:"blink",browser:"chrome",version:Number(o[1])};let e=t.match(/Version\/(\d+(?:\.\d+)?).*Safari/);return e?{engine:"webkit",browser:"safari",version:Number(e[1])}:{engine:"unknown",browser:"unknown",version:0}})(),t=o[e.engine];return t&&t<=e.version}function e(){if(!((e=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)"))&&e.matches||!(!(e=navigator.connection||navigator.mozConnection||navigator.webkitConnection)||!e.saveData))&&i()){var e=document.createElement("canvas");if(e=e.getContext("webgl",{failIfMajorPerformanceCaveat:!0})||e.getContext("experimental-webgl",{failIfMajorPerformanceCaveat:!0})){var t=e.getExtension("WEBGL_debug_renderer_info");if(t){e=e.getParameter(t.UNMASKED_RENDERER_WEBGL)||"";if(/swiftshader|llvmpipe|software|mesa offscreen/i.test(e))return!!void 0}return!!1}return!1}}let n=`
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `,r=`
    precision mediump float;

    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec4 iMouse;
    uniform sampler2D iChannel0;
    uniform vec2 iImageResolution;
    uniform float iBaseAlpha;
    uniform float iEffectAlpha;

    void mainImage(out vec4 fragColor, in vec2 fragCoord)
    {
      const float NUM_ZERO = 0.0;
      const float NUM_ONE = 1.0;
      const float NUM_HALF = 0.5;
      const float NUM_TWO = 2.0;
      const float POWER_EXPONENT = 6.0;
      const float MASK_MULTIPLIER_1 = 10000.0;
      const float MASK_MULTIPLIER_2 = 9500.0;
      const float MASK_MULTIPLIER_3 = 11000.0;
      const float LENS_MULTIPLIER = 5000.0;
      const float MASK_STRENGTH_1 = 8.0;
      const float MASK_STRENGTH_2 = 16.0;
      const float MASK_STRENGTH_3 = 2.0;
      const float MASK_THRESHOLD_1 = 0.95;
      const float MASK_THRESHOLD_2 = 0.9;
      const float MASK_THRESHOLD_3 = 1.5;
      const float SAMPLE_RANGE = 4.0;
      const float SAMPLE_OFFSET = 0.5;
      const float GRADIENT_RANGE = 0.2;
      const float GRADIENT_OFFSET = 0.1;
      const float GRADIENT_EXTREME = -1000.0;
      const float LIGHTING_INTENSITY = 0.3;

      vec2 uv = fragCoord / iResolution.xy;
      vec2 mouse = iMouse.xy;

      if (length(mouse) < NUM_ONE) {
        mouse = iResolution.xy / NUM_TWO;
      }

      vec2 m2 = uv - mouse / iResolution.xy;

      float roundedBox =
        pow(abs(m2.x * iResolution.x / iResolution.y), POWER_EXPONENT) +
        pow(abs(m2.y), POWER_EXPONENT);

      float rb1 =
        clamp((NUM_ONE - roundedBox * MASK_MULTIPLIER_1) * MASK_STRENGTH_1, NUM_ZERO, NUM_ONE);

      float rb2 =
        clamp((MASK_THRESHOLD_1 - roundedBox * MASK_MULTIPLIER_2) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE) -
        clamp(pow(MASK_THRESHOLD_2 - roundedBox * MASK_MULTIPLIER_2, NUM_ONE) * MASK_STRENGTH_2, NUM_ZERO, NUM_ONE);

      float rb3 =
        clamp((MASK_THRESHOLD_3 - roundedBox * MASK_MULTIPLIER_3) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE) -
        clamp(pow(NUM_ONE - roundedBox * MASK_MULTIPLIER_3, NUM_ONE) * MASK_STRENGTH_3, NUM_ZERO, NUM_ONE);

      fragColor = vec4(NUM_ZERO);

      float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);

      if (transition > NUM_ZERO) {
        vec2 lens =
          ((uv - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBox * LENS_MULTIPLIER) + NUM_HALF);

        float total = NUM_ZERO;

        for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
          for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
            vec2 offset = vec2(x, y) * SAMPLE_OFFSET / iResolution.xy;
            fragColor += texture2D(iChannel0, offset + lens);
            total += NUM_ONE;
          }
        }

        fragColor /= total;

        float gradient =
          clamp((clamp(m2.y, NUM_ZERO, GRADIENT_RANGE) + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE) +
          clamp((clamp(-m2.y, GRADIENT_EXTREME, GRADIENT_RANGE) * rb3 + GRADIENT_OFFSET) / NUM_TWO, NUM_ZERO, NUM_ONE);

        vec4 lighting = clamp(
          fragColor + vec4(rb1) * gradient + vec4(rb2) * LIGHTING_INTENSITY,
          NUM_ZERO,
          NUM_ONE
        );

        fragColor = mix(texture2D(iChannel0, uv), lighting, transition);
      } else {
        fragColor = texture2D(iChannel0, uv);
      }

      fragColor.a = mix(iBaseAlpha, iEffectAlpha, transition);
    }

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
  `;function l(e,t,o){t=e.createShader(t);return e.shaderSource(t,o),e.compileShader(t),e.getShaderParameter(t,e.COMPILE_STATUS)?t:(console.error("[LiquidGlass] Shader compile error:",e.getShaderInfoLog(t)),e.deleteShader(t),null)}function g(e,t){var e=e.getBoundingClientRect(),o=window.devicePixelRatio||1,a=Math.max(1,Math.floor(e.width*o)),o=Math.max(1,Math.floor(e.height*o));t.style.width=e.width+"px",t.style.height=e.height+"px",t.width!==a&&(t.width=a),t.height!==o&&(t.height=o)}function s(E,f,m){if(E&&"true"!==E.dataset.liquidGlassWebglBound){E.dataset.liquidGlassWebglBound="true",E.dataset.liquidGlassTarget=m.name;let u=document.createElement("canvas"),d=(u.className="liquid-glass-webgl-canvas",E.prepend(u),u.getContext("webgl",{alpha:!0,antialias:!0,premultipliedAlpha:!1,preserveDrawingBuffer:!1,failIfMajorPerformanceCaveat:!0}));if(d){R=d,t=l(R,R.VERTEX_SHADER,n),_=l(R,R.FRAGMENT_SHADER,r);let c=t&&_?(o=R.createProgram(),R.attachShader(o,t),R.attachShader(o,_),R.linkProgram(o),R.getProgramParameter(o,R.LINK_STATUS)?o:(console.error("[LiquidGlass] Program link error:",R.getProgramInfoLog(o)),R.deleteProgram(o),null)):null;var t,o,_,R;if(c){d.useProgram(c),t=d,_=c,R=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,R),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW),R=t.getAttribLocation(_,"position"),t.enableVertexAttribArray(R),t.vertexAttribPointer(R,2,t.FLOAT,!1,0,0);let a={resolution:d.getUniformLocation(c,"iResolution"),time:d.getUniformLocation(c,"iTime"),mouse:d.getUniformLocation(c,"iMouse"),texture:d.getUniformLocation(c,"iChannel0"),imageResolution:d.getUniformLocation(c,"iImageResolution"),baseAlpha:d.getUniformLocation(c,"iBaseAlpha"),effectAlpha:d.getUniformLocation(c,"iEffectAlpha")},i=(o=d,_=f,R=o.createTexture(),o.bindTexture(o.TEXTURE_2D,R),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,!0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,_),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),R),n=(g(E,u),[u.width/2,u.height/2]),r=performance.now(),e=()=>{n=[u.width/2,u.height/2]},l=(E.addEventListener("pointermove",e=>{var t=E.getBoundingClientRect(),o=window.devicePixelRatio||1;n=[(e.clientX-t.left)*o,u.height-(e.clientY-t.top)*o]}),E.addEventListener("pointerleave",e),()=>{g(E,u),e()}),s=(E.__liquidGlassResize=l,window.addEventListener("resize",l),null);"ResizeObserver"in window&&(s=new ResizeObserver(l)).observe(E),!function e(){var t,o;document.body.contains(E)?(t=E,(o=m).pauseWhenInactive&&"function"==typeof o.isActive&&!o.isActive(t)||(d.viewport(0,0,u.width,u.height),d.clearColor(0,0,0,0),d.clear(d.COLOR_BUFFER_BIT),d.useProgram(c),d.uniform3f(a.resolution,u.width,u.height,1),d.uniform1f(a.time,(performance.now()-r)/1e3),d.uniform4f(a.mouse,n[0],n[1],0,0),d.uniform2f(a.imageResolution,f.naturalWidth,f.naturalHeight),d.uniform1f(a.baseAlpha,"number"==typeof m.baseAlpha?m.baseAlpha:0),d.uniform1f(a.effectAlpha,"number"==typeof m.effectAlpha?m.effectAlpha:1),d.activeTexture(d.TEXTURE0),d.bindTexture(d.TEXTURE_2D,i),d.uniform1i(a.texture,0),d.drawArrays(d.TRIANGLE_STRIP,0,4)),requestAnimationFrame(e)):(s&&s.disconnect(),window.removeEventListener("resize",l))}()}else E.classList.add("liquid-glass-webgl-fallback")}else E.classList.add("liquid-glass-webgl-fallback")}}let c=null;function u(){e()?(document.documentElement.classList.remove("liquid-glass-webgl-disabled"),document.documentElement.classList.add("liquid-glass-webgl-enabled"),(c=c||new Promise((e,t)=>{let o=new Image;o.crossOrigin="anonymous",o.onload=()=>{e(o)},o.onerror=()=>{t(new Error("[LiquidGlass] Failed to load image: "+a))},o.src=a})).then(o=>{t.forEach(t=>{document.querySelectorAll(t.selector).forEach(e=>{s(e,o,t)})})}).catch(e=>{console.warn(e),document.documentElement.classList.remove("liquid-glass-webgl-enabled"),document.documentElement.classList.add("liquid-glass-webgl-disabled")})):(document.documentElement.classList.remove("liquid-glass-webgl-enabled"),document.documentElement.classList.add("liquid-glass-webgl-disabled"))}function d(){let e=document.querySelector(".search-pop-overlay");e&&"true"!==e.dataset.liquidGlassObserverBound&&(e.dataset.liquidGlassObserverBound="true","MutationObserver"in window)&&new MutationObserver(()=>{e.classList.contains("active")&&window.setTimeout(()=>{u(),t.forEach(e=>{document.querySelectorAll(e.selector).forEach(e=>{"function"==typeof e.__liquidGlassResize&&e.__liquidGlassResize()})})},80)}).observe(e,{attributes:!0,attributeFilter:["class"]})}function E(){u(),d()}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",E,{once:!0}):E(),document.addEventListener("swup:contentReplaced",E)})();