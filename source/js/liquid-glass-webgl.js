(() => {
  const IMAGE_URL = "https://t.alcy.cc/moez";

  const TARGETS = [
    {
      selector: ".home-banner-container .social-contacts",
      name: "home-social",
      pauseWhenInactive: false,
      baseAlpha: 0.62,
      effectAlpha: 1.0,
    },
    {
      selector: ".search-pop-overlay .search-popup",
      name: "search-popup",
      pauseWhenInactive: true,
      baseAlpha: 0.62,
      effectAlpha: 1.0,
      isActive(target) {
        const overlay = target.closest(".search-pop-overlay");
        return !!overlay && overlay.classList.contains("active");
      },
    },
  ];

  const MINIMUM_ENGINE_VERSIONS = {
    blink: 96,
    gecko: 96,
    webkit: 15,
  };

  function getBrowserEngineInfo() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    if (isIOS) {
      const safariMatch = ua.match(/Version\/(\d+(?:\.\d+)?)/);
      const iosMatch = ua.match(/OS (\d+)_/);

      return {
        engine: "webkit",
        browser: "ios-webkit",
        version: Number((safariMatch && safariMatch[1]) || (iosMatch && iosMatch[1]) || 0),
      };
    }

    const firefoxMatch = ua.match(/Firefox\/(\d+(?:\.\d+)?)/);
    if (firefoxMatch) {
      return {
        engine: "gecko",
        browser: "firefox",
        version: Number(firefoxMatch[1]),
      };
    }

    const edgeMatch = ua.match(/Edg\/(\d+(?:\.\d+)?)/);
    if (edgeMatch) {
      return {
        engine: "blink",
        browser: "edge",
        version: Number(edgeMatch[1]),
      };
    }

    const operaMatch = ua.match(/OPR\/(\d+(?:\.\d+)?)/);
    if (operaMatch) {
      return {
        engine: "blink",
        browser: "opera",
        version: Number(operaMatch[1]),
      };
    }

    const chromeMatch = ua.match(/Chrome\/(\d+(?:\.\d+)?)/);
    if (chromeMatch) {
      return {
        engine: "blink",
        browser: "chrome",
        version: Number(chromeMatch[1]),
      };
    }

    const safariMatch = ua.match(/Version\/(\d+(?:\.\d+)?).*Safari/);
    if (safariMatch) {
      return {
        engine: "webkit",
        browser: "safari",
        version: Number(safariMatch[1]),
      };
    }

    return {
      engine: "unknown",
      browser: "unknown",
      version: 0,
    };
  }

  function isBrowserVersionLikelyOkay() {
    const info = getBrowserEngineInfo();
    const minimum = MINIMUM_ENGINE_VERSIONS[info.engine];

    if (!minimum) {
      return false;
    }

    return info.version >= minimum;
  }

  function isUserOptingOutOfEffects() {
    const reduceMotionQuery = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotionQuery && reduceMotionQuery.matches) {
      return true;
    }

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection && connection.saveData) {
      return true;
    }

    return false;
  }

  function canCreateWebGLContext() {
    const canvas = document.createElement("canvas");

    const gl =
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: true });

    if (!gl) {
      return false;
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";

      if (/swiftshader|llvmpipe|software|mesa offscreen/i.test(renderer)) {
        return false;
      }
    }

    return true;
  }

  function canUseWebGLLiquidGlass() {
    if (isUserOptingOutOfEffects()) {
      return false;
    }

    if (!isBrowserVersionLikelyOkay()) {
      return false;
    }

    if (!canCreateWebGLContext()) {
      return false;
    }

    return true;
  }

  const vertexShaderSource = `
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
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
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("[LiquidGlass] Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function createProgram(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[LiquidGlass] Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  function setupGeometry(gl, program) {
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, "position");

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  function setupTexture(gl, img) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      img
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  }

  function resizeCanvas(target, canvas) {
    const rect = target.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    if (canvas.width !== width) {
      canvas.width = width;
    }

    if (canvas.height !== height) {
      canvas.height = height;
    }
  }

  function loadImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error("[LiquidGlass] Failed to load image: " + IMAGE_URL));
      };

      img.src = IMAGE_URL;
    });
  }

  function isTargetActive(target, config) {
    if (!config.pauseWhenInactive) {
      return true;
    }

    if (typeof config.isActive === "function") {
      return config.isActive(target);
    }

    return true;
  }

  function bindLiquidGlass(target, img, config) {
    if (!target || target.dataset.liquidGlassWebglBound === "true") {
      return;
    }

    target.dataset.liquidGlassWebglBound = "true";
    target.dataset.liquidGlassTarget = config.name;

    const canvas = document.createElement("canvas");
    canvas.className = "liquid-glass-webgl-canvas";
    target.prepend(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    });

    if (!gl) {
      target.classList.add("liquid-glass-webgl-fallback");
      return;
    }

    const program = createProgram(gl);

    if (!program) {
      target.classList.add("liquid-glass-webgl-fallback");
      return;
    }

    gl.useProgram(program);
    setupGeometry(gl, program);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "iResolution"),
      time: gl.getUniformLocation(program, "iTime"),
      mouse: gl.getUniformLocation(program, "iMouse"),
      texture: gl.getUniformLocation(program, "iChannel0"),
      imageResolution: gl.getUniformLocation(program, "iImageResolution"),
      baseAlpha: gl.getUniformLocation(program, "iBaseAlpha"),
      effectAlpha: gl.getUniformLocation(program, "iEffectAlpha"),
    };

    const texture = setupTexture(gl, img);

    resizeCanvas(target, canvas);

    let mouse = [canvas.width / 2, canvas.height / 2];
    const startTime = performance.now();

    const updateMouseToCenter = () => {
      mouse = [canvas.width / 2, canvas.height / 2];
    };

    target.addEventListener("pointermove", (event) => {
      const rect = target.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      mouse = [
        (event.clientX - rect.left) * dpr,
        canvas.height - (event.clientY - rect.top) * dpr,
      ];
    });

    target.addEventListener("pointerleave", updateMouseToCenter);

    const handleResize = () => {
      resizeCanvas(target, canvas);
      updateMouseToCenter();
    };

    target.__liquidGlassResize = handleResize;

    window.addEventListener("resize", handleResize);

    let resizeObserver = null;

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(target);
    }

    function render() {
      if (!document.body.contains(target)) {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }

        window.removeEventListener("resize", handleResize);
        return;
      }

      if (!isTargetActive(target, config)) {
        requestAnimationFrame(render);
        return;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniforms.time, (performance.now() - startTime) / 1000);
      gl.uniform4f(uniforms.mouse, mouse[0], mouse[1], 0.0, 0.0);
      gl.uniform2f(uniforms.imageResolution, img.naturalWidth, img.naturalHeight);
      gl.uniform1f(uniforms.baseAlpha, typeof config.baseAlpha === "number" ? config.baseAlpha : 0.0);
      gl.uniform1f(uniforms.effectAlpha, typeof config.effectAlpha === "number" ? config.effectAlpha : 1.0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(render);
    }

    render();
  }

  let imagePromise = null;

  function initLiquidGlass() {
    if (!canUseWebGLLiquidGlass()) {
      document.documentElement.classList.remove("liquid-glass-webgl-enabled");
      document.documentElement.classList.add("liquid-glass-webgl-disabled");
      return;
    }

    document.documentElement.classList.remove("liquid-glass-webgl-disabled");
    document.documentElement.classList.add("liquid-glass-webgl-enabled");

    if (!imagePromise) {
      imagePromise = loadImage();
    }

    imagePromise
      .then((img) => {
        TARGETS.forEach((config) => {
          document.querySelectorAll(config.selector).forEach((target) => {
            bindLiquidGlass(target, img, config);
          });
        });
      })
      .catch((error) => {
        console.warn(error);
        document.documentElement.classList.remove("liquid-glass-webgl-enabled");
        document.documentElement.classList.add("liquid-glass-webgl-disabled");
      });
  }

  function resizeLiquidGlassTargets() {
    TARGETS.forEach((config) => {
      document.querySelectorAll(config.selector).forEach((target) => {
        if (typeof target.__liquidGlassResize === "function") {
          target.__liquidGlassResize();
        }
      });
    });
  }

  function observeSearchPopup() {
    const overlay = document.querySelector(".search-pop-overlay");

    if (!overlay || overlay.dataset.liquidGlassObserverBound === "true") {
      return;
    }

    overlay.dataset.liquidGlassObserverBound = "true";

    if (!("MutationObserver" in window)) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (!overlay.classList.contains("active")) {
        return;
      }

      window.setTimeout(() => {
        initLiquidGlass();
        resizeLiquidGlassTargets();
      }, 80);
    });

    observer.observe(overlay, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function bootLiquidGlass() {
    initLiquidGlass();
    observeSearchPopup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLiquidGlass, { once: true });
  } else {
    bootLiquidGlass();
  }

  document.addEventListener("swup:contentReplaced", bootLiquidGlass);
})();
