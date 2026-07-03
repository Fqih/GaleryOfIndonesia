import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useThreeEngine({ mountRef, graphicsQuality }) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xffffff, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, graphicsQuality === 'high' ? 1.0 : 0.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Resize Handler
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    const disposeScene = (sceneObj) => {
      if (!sceneObj) return;
      sceneObj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              if (mat.bumpMap) mat.bumpMap.dispose();
              if (mat.emissiveMap) mat.emissiveMap.dispose();
              mat.dispose();
            });
          } else {
            if (child.material.map) child.material.map.dispose();
            if (child.material.bumpMap) child.material.bumpMap.dispose();
            if (child.material.emissiveMap) child.material.emissiveMap.dispose();
            child.material.dispose();
          }
        }
      });
      sceneObj.clear();
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        disposeScene(sceneRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      if (graphicsQuality === 'high') {
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
      } else {
        rendererRef.current.setPixelRatio(0.75);
      }
    }
  }, [graphicsQuality]);

  return { scene: sceneRef.current, camera: cameraRef.current, renderer: rendererRef.current };
}
