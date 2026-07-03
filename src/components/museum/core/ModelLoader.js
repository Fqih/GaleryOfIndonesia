import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let gltfLoaderInstance = null;

export function getGLTFLoader() {
  if (!gltfLoaderInstance) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.preload();

    gltfLoaderInstance = new GLTFLoader();
    gltfLoaderInstance.setDRACOLoader(dracoLoader);
  }
  return gltfLoaderInstance;
}

export function loadArtifactModel(modelPath, wrapperGroup, options = {}) {
  const { targetSize = 0.6, alignBottom = false, yOffset = 0 } = options;
  const loader = getGLTFLoader();
  
  const path = typeof modelPath === 'number' || (typeof modelPath === 'string' && !modelPath.includes('.glb')) 
                ? `/models/item${modelPath}.glb` 
                : `/models/${modelPath}`;

  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;

      // Aktifkan bayangan
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Auto-Scaling & Centering
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = targetSize / maxDim;
      model.scale.setScalar(scaleFactor);

      const yPos = alignBottom 
        ? -box.min.y * scaleFactor + yOffset
        : -center.y * scaleFactor + yOffset;

      model.position.set(
        -center.x * scaleFactor,
        yPos,
        -center.z * scaleFactor
      );

      wrapperGroup.add(model);
    },
    undefined,
    (error) => {
      console.warn(`Gagal memuat ${path} (pastikan file ada di public/models):`, error);
    }
  );
}
