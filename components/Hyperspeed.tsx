import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import './Hyperspeed.css';

// Theme-based color conversion utility
const getThemeColor = (cssVar: string, fallback: number) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar);
  if (value) {
    // For oklch values, we'll use a simplified conversion
    if (value.includes('oklch')) {
      // Extract lightness and convert to approximate hex
      const lightness = parseFloat(value.match(/oklch\(([^,]+)/)?.[1] || '0.5');
      const hex = Math.round(lightness * 255);
      return (hex << 16) | (hex << 8) | hex;
    }
    return parseInt(value.replace('#', ''), 16) || fallback;
  }
  return fallback;
};

// Utility functions
const random = (base: number | number[]) => {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
};

const pickRandom = (arr: any) => {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
};

function lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) {
    change = target - current;
  }
  return change;
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer, setSize: (width: number, height: number, updateStyles?: boolean) => void) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    setSize(width, height, false);
  }
  return needResize;
}

const Hyperspeed = ({ effectOptions = {} }) => {
  const hyperspeed = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (appRef.current) {
      appRef.current.dispose();
      const container = document.getElementById('lights');
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    }

    // Use theme colors that match the Past Yous app theme
    const themeColors = {
      roadColor: getThemeColor('--background', 0x2d2c2e),
      islandColor: getThemeColor('--card', 0x2e2e2e),
      background: getThemeColor('--background', 0x2d2c2e),
      shoulderLines: getThemeColor('--muted-foreground', 0x626268),
      brokenLines: getThemeColor('--muted-foreground', 0x626268),
      leftCars: [getThemeColor('--primary', 0xb8860b), getThemeColor('--secondary', 0x4a9eff)],
      rightCars: [getThemeColor('--accent', 0x525252), getThemeColor('--muted-foreground', 0x626268)],
      sticks: getThemeColor('--primary', 0xb8860b)
    };

    const options = {
      onSpeedUp: () => {},
      onSlowDown: () => {},
      distortion: 'turbulentDistortion',
      length: 400,
      roadWidth: 10,
      islandWidth: 2,
      lanesPerRoad: 4,
      fov: 90,
      fovSpeedUp: 150,
      speedUp: 2,
      carLightsFade: 0.4,
      totalSideLightSticks: 20,
      lightPairsPerRoadWay: 40,
      shoulderLinesWidthPercentage: 0.05,
      brokenLinesWidthPercentage: 0.1,
      brokenLinesLengthPercentage: 0.5,
      lightStickWidth: [0.12, 0.5],
      lightStickHeight: [1.3, 1.7],
      movingAwaySpeed: [60, 80],
      movingCloserSpeed: [-120, -160],
      carLightsLength: [400 * 0.03, 400 * 0.2],
      carLightsRadius: [0.05, 0.14],
      carWidthPercentage: [0.3, 0.5],
      carShiftX: [-0.8, 0.8],
      carFloorSeparation: [0, 5],
      colors: themeColors,
      ...effectOptions
    };

    // Distortion configurations
    const mountainUniforms = {
      uFreq: { value: new THREE.Vector3(3, 6, 10) },
      uAmp: { value: new THREE.Vector3(30, 30, 20) }
    };

    const turbulentUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) }
    };

    let nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

    const distortions = {
      turbulentDistortion: {
        uniforms: turbulentUniforms,
        getDistortion: `
          uniform vec4 uFreq;
          uniform vec4 uAmp;
          float nsin(float val){
            return sin(val) * 0.5 + 0.5;
          }
          #define PI 3.14159265358979
          float getDistortionX(float progress){
            return (
              cos(PI * progress * uFreq.r + uTime) * uAmp.r +
              pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g
            );
          }
          float getDistortionY(float progress){
            return (
              -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
              -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
            );
          }
          vec3 getDistortion(float progress){
            return vec3(
              getDistortionX(progress) - getDistortionX(0.0125),
              getDistortionY(progress) - getDistortionY(0.0125),
              0.
            );
          }
        `,
        getJS: (progress: number, time: number) => {
          const uFreq = turbulentUniforms.uFreq.value;
          const uAmp = turbulentUniforms.uAmp.value;

          const getX = (p: number) =>
            Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x +
            Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;

          const getY = (p: number) =>
            -nsin(Math.PI * p * uFreq.z + time) * uAmp.z -
            Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;

          let distortion = new THREE.Vector3(
            getX(progress) - getX(progress + 0.007),
            getY(progress) - getY(progress + 0.007),
            0
          );
          let lookAtAmp = new THREE.Vector3(-2, -5, 0);
          let lookAtOffset = new THREE.Vector3(0, 0, -10);
          return distortion.multiply(lookAtAmp).add(lookAtOffset);
        }
      }
    };

    // Main App class
    class App {
      container: HTMLElement;
      renderer: THREE.WebGLRenderer;
      composer: EffectComposer;
      camera: THREE.PerspectiveCamera;
      scene: THREE.Scene;
      clock: THREE.Clock;
      road: any;
      leftCarLights: any;
      rightCarLights: any;
      leftSticks: any;
      fovTarget: number;
      speedUpTarget: number;
      speedUp: number;
      timeOffset: number;
      disposed: boolean;
      fogUniforms: any;
      options: any;
      renderPass: any;
      bloomPass: any;

      constructor(container: HTMLElement, options: any) {
        this.options = options;
        this.container = container;
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true
        });
        this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.composer = new EffectComposer(this.renderer);
        container.append(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
          options.fov,
          container.offsetWidth / container.offsetHeight,
          0.1,
          10000
        );
        this.camera.position.z = -5;
        this.camera.position.y = 8;
        this.camera.position.x = 0;
        this.scene = new THREE.Scene();
        this.scene.background = null;

        let fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
        this.scene.fog = fog;
        this.fogUniforms = {
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far }
        };
        this.clock = new THREE.Clock();
        this.disposed = false;

        this.fovTarget = options.fov;
        this.speedUpTarget = 0;
        this.speedUp = 0;
        this.timeOffset = 0;
      }

      initPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.bloomPass = new EffectPass(
          this.camera,
          new BloomEffect({
            luminanceThreshold: 0.2,
            luminanceSmoothing: 0,
            resolutionScale: 1
          })
        );

        const smaaPass = new EffectPass(
          this.camera,
          new SMAAEffect({
            preset: SMAAPreset.MEDIUM
          })
        );
        this.renderPass.renderToScreen = false;
        this.bloomPass.renderToScreen = false;
        smaaPass.renderToScreen = true;
        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(smaaPass);
      }

      init() {
        this.initPasses();
        this.tick();
      }

      update(delta: number) {
        let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
        this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
        this.timeOffset += this.speedUp * delta;

        let time = this.clock.elapsedTime + this.timeOffset;

        let updateCamera = false;
        let fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
        if (fovChange !== 0) {
          this.camera.fov += fovChange * delta * 6;
          updateCamera = true;
        }

        if (this.options.distortion.getJS) {
          const distortion = this.options.distortion.getJS(0.025, time);
          this.camera.lookAt(
            new THREE.Vector3(
              this.camera.position.x + distortion.x,
              this.camera.position.y + distortion.y,
              this.camera.position.z + distortion.z
            )
          );
          updateCamera = true;
        }
        if (updateCamera) {
          this.camera.updateProjectionMatrix();
        }
      }

      render(delta: number) {
        this.composer.render(delta);
      }

      dispose() {
        this.disposed = true;
        if (this.renderer) {
          this.renderer.dispose();
        }
        if (this.composer) {
          this.composer.dispose();
        }
        if (this.scene) {
          this.scene.clear();
        }
      }

      setSize(width: number, height: number, updateStyles?: boolean) {
        this.composer.setSize(width, height, updateStyles);
      }

      tick() {
        if (this.disposed || !this) return;
        if (resizeRendererToDisplaySize(this.renderer, this.setSize.bind(this))) {
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }
        const delta = this.clock.getDelta();
        this.render(delta);
        this.update(delta);
        requestAnimationFrame(this.tick.bind(this));
      }
    }

    // Initialize the app
    const container = document.getElementById('lights');
    if (container) {
      const optionsWithDistortion = { ...options };
      optionsWithDistortion.distortion = distortions[options.distortion];

      const myApp = new App(container, optionsWithDistortion);
      appRef.current = myApp;
      myApp.init();
    }

    return () => {
      if (appRef.current) {
        appRef.current.dispose();
      }
    };
  }, [effectOptions]);

  return <div id="lights" ref={hyperspeed}></div>;
};

export default Hyperspeed;
