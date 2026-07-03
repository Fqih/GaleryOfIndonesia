import * as THREE from 'three';
import { provincesData } from '../../../data/provincesData.jsx';
import { createKawungTexture, createMarbleTexture, createFlutedTexture } from './EnvironmentBuilder.js';

import { getGLTFLoader } from './ModelLoader.js';

export function buildMuseumGeometry(scene, renderer) {
  const portals = [];
  const artifacts = [];
  const pillarPositions = [];
  const interactableCases = []; // Untuk Raycaster
  const createdPlaqueTextures = [];

  // Textures
  const kawungBump = createKawungTexture();
  kawungBump.repeat.set(24, 4);
  const marbleTex = createMarbleTexture(renderer);
  const flutedBump = createFlutedTexture();
  flutedBump.repeat.set(2, 1); // 32 vertical grooves total

  const createPlaqueTexture = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, 1012, 244);
    ctx.fillStyle = '#ffea00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 96px "Times New Roman", serif';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 15;
    ctx.fillText(text.toUpperCase(), 512, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    createdPlaqueTextures.push(tex);
    return tex;
  };

  const createBannerTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, 0, 256, 341);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 341, 256, 683);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 240, 1008);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const createBannerEmissive = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Draw base colors
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(0, 0, 256, 341);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 341, 256, 683);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 240, 1008);

    // Apply lighting gradient
    ctx.globalCompositeOperation = 'multiply';
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    // WebGL textures are flipped, but we draw natively on Canvas, so y=0 is top!
    gradient.addColorStop(0, '#ffaa44'); // Warm gold at top
    gradient.addColorStop(0.3, '#442200'); // Quick fade
    gradient.addColorStop(1, '#000000'); // No glow at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  const bannerTex = createBannerTexture();
  const bannerGeo = new THREE.PlaneGeometry(1.5, 8);
  const bannerPoleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8);
  bannerPoleGeo.rotateZ(Math.PI / 2); // Horizontal
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTex,
    emissive: 0xffffff,
    emissiveMap: createBannerEmissive(),
    emissiveIntensity: 1.5,
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  // 1. Floor
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: marbleTex, roughness: 0.15, metalness: 0.1 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 2. Circular Wall
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa, roughness: 0.7, metalness: 0.05, bumpMap: kawungBump, bumpScale: 0.02, side: THREE.BackSide
  });
  const wallGeo = new THREE.CylinderGeometry(25.1, 25.1, 20, 64, 1, true); // openEnded true
  const circularWall = new THREE.Mesh(wallGeo, wallMat);
  circularWall.position.set(0, 10, 0);
  circularWall.receiveShadow = false;
  scene.add(circularWall);

  // 3. Ceiling & Skylight
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0, side: THREE.DoubleSide });
  const ceilData = [
    { w: 60, h: 20, x: 0, z: -20 }, { w: 60, h: 20, x: 0, z: 20 },
    { w: 20, h: 20, x: 20, z: 0 }, { w: 20, h: 20, x: -20, z: 0 }
  ];
  ceilData.forEach(cd => {
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(cd.w, cd.h), ceilingMat);
    ceil.rotation.x = -Math.PI / 2;
    ceil.position.set(cd.x, 20, cd.z);
    ceil.frustumCulled = false;
    scene.add(ceil);
  });

  const skylightGeo = new THREE.PlaneGeometry(20, 20);
  const skylightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.5 });
  const skylight = new THREE.Mesh(skylightGeo, skylightMat);
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(0, 20, 0);
  scene.add(skylight);

  // 3.5 Chandelier Model Load (MAXIMUM PERFORMANCE)
  const loader = getGLTFLoader();
  loader.load('/models/chandeleir.glb', (gltf) => {
    const chandelier = gltf.scene;

    // 1. Clean up unused/heavy data BEFORE scaling
    chandelier.traverse((child) => {
      // Remove any hidden lights or cameras exported from blender
      if (child.isLight || child.isCamera) {
        child.visible = false;
      }
    });

    // 2. Compute TRUE bounding box (only visible meshes)
    const computeVisibleBox = (object) => {
      const box = new THREE.Box3();
      box.makeEmpty();
      object.traverse((child) => {
        if (child.isMesh && child.visible) {
          child.geometry.computeBoundingBox();
          const childBox = new THREE.Box3().copy(child.geometry.boundingBox);
          childBox.applyMatrix4(child.matrixWorld);
          box.union(childBox);
        }
      });
      return box;
    };

    chandelier.updateMatrixWorld(true);
    const box = computeVisibleBox(chandelier);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 5 / maxDim; // Your custom scale
      chandelier.scale.set(scale, scale, scale);
    }

    // Recalculate true bounding box after scale
    chandelier.updateMatrixWorld(true);
    const boxScaled = computeVisibleBox(chandelier);

    // 3. Fix to ceiling perfectly
    // The ceiling skylight is exactly at Y=20.
    // If the top of the scaled model is at topY, we must shift the entire model up by (20 - topY)
    const topY = boxScaled.max.y;
    chandelier.position.set(0, chandelier.position.y + (20 - topY), 0);

    // PERFORMANCE OPTIMIZATION: Freeze matrix since it never moves
    chandelier.matrixAutoUpdate = false;
    chandelier.updateMatrix();

    // 4. Ultimate FPS Fix
    chandelier.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.matrixAutoUpdate = false;
        child.updateMatrix();

        if (child.material) {
          // Force opaque for EVERYTHING. Overlapping transparency kills FPS.
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.depthWrite = true;
          child.material.side = THREE.FrontSide; // DoubleSide is 2x slower

          child.material.metalness = Math.max(child.material.metalness || 0, 0.6);
          child.material.roughness = Math.min(child.material.roughness || 1, 0.3);

          const matName = child.material.name ? child.material.name.toLowerCase() : '';
          const meshName = child.name ? child.name.toLowerCase() : '';

          if (matName.includes('glass') || matName.includes('crystal') || matName.includes('light') || matName.includes('bulb') || matName.includes('emission') ||
            meshName.includes('glass') || meshName.includes('crystal') || meshName.includes('light') || meshName.includes('bulb')) {
            child.material.emissive = new THREE.Color(0xfffaee);
            child.material.emissiveIntensity = 4.0;
          }
        }
      }
    });

    scene.add(chandelier);
  });


  // 4. Pillars (Batik Kawung Gold)
  const pillarGeo = new THREE.CylinderGeometry(1.2, 1.2, 20, 32);
  const pillarBaseGeo1 = new THREE.CylinderGeometry(1.5, 1.5, 0.4, 32);
  const pillarBaseGeo2 = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32);
  const pillarCapitalGeo1 = new THREE.CylinderGeometry(1.5, 1.2, 0.5, 32);
  const pillarCapitalGeo2 = new THREE.CylinderGeometry(1.9, 1.9, 0.2, 32);

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xffd700, bumpMap: kawungBump, bumpScale: 0.4, roughness: 0.2, metalness: 0.9
  });

  const pillarRadius = 10;
  const gapIndices = [4.5, 14.5, 23.5, 33.5];
  gapIndices.forEach(gapIndex => {
    const angle = (gapIndex / 38) * Math.PI * 2;
    const px = Math.sin(angle) * pillarRadius;
    const pz = -Math.cos(angle) * pillarRadius;
    pillarPositions.push({ x: px, z: pz });

    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, 10, pz);
    pillar.castShadow = true; pillar.receiveShadow = true;
    scene.add(pillar);

    const base1 = new THREE.Mesh(pillarBaseGeo1, pillarMat);
    base1.position.set(px, 0.2, pz);
    base1.castShadow = true; base1.receiveShadow = true;
    scene.add(base1);

    const base2 = new THREE.Mesh(pillarBaseGeo2, pillarMat);
    base2.position.set(px, 0.1, pz);
    base2.castShadow = true; base2.receiveShadow = true;
    scene.add(base2);

    const cap1 = new THREE.Mesh(pillarCapitalGeo1, pillarMat);
    cap1.position.set(px, 19.5, pz);
    cap1.castShadow = true; cap1.receiveShadow = true;
    scene.add(cap1);

    const cap2 = new THREE.Mesh(pillarCapitalGeo2, pillarMat);
    cap2.position.set(px, 19.8, pz);
    cap2.castShadow = true; cap2.receiveShadow = true;
    scene.add(cap2);
  });

  // 5. Portals & Archways
  const doorWidth = 2.2;
  const doorHeight = 3.8;
  const portalSurfaceGeo = new THREE.PlaneGeometry(doorWidth, doorHeight);
  const frameGeo = new THREE.BoxGeometry(doorWidth + 0.2, doorHeight + 0.2, 0.1);
  frameGeo.translate(0, 0, -0.05);

  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9, metalness: 0.0 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.2 });

  // Archway (Gapura) Materials & Geometries
  const gapuraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: marbleTex, roughness: 0.4, metalness: 0.1 });
  const gapuraPillarGeo = new THREE.BoxGeometry(0.5, 4.4, 0.4);
  const gapuraLintelGeo = new THREE.BoxGeometry(3.8, 0.8, 0.6);
  const plaqueGeo = new THREE.PlaneGeometry(2.4, 0.6);

  // Center Square Carpet
  const centerCarpetGeo = new THREE.PlaneGeometry(20, 20);
  const centerCarpet = new THREE.Mesh(centerCarpetGeo, carpetMat);
  centerCarpet.rotation.x = -Math.PI / 2;
  centerCarpet.position.set(0, 0.02, 0);
  centerCarpet.receiveShadow = true;
  scene.add(centerCarpet);

  // Radiating Corridor Carpets
  const corridorCarpetGeo = new THREE.PlaneGeometry(1.8, 23);
  corridorCarpetGeo.translate(0, 11.5, 0);

  // Stanchions & Ropes & Lamps
  const stanchionGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.9, 8);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 });
  const floorLampGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 12);
  const lampGlowGeo = new THREE.SphereGeometry(0.15, 12, 12);
  const lampGlowMat = new THREE.MeshStandardMaterial({ color: 0xffddaa, emissive: 0xffddaa, emissiveIntensity: 2 });
  const picFrameMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00, roughness: 0.35, metalness: 0.6, bumpMap: flutedBump, bumpScale: 0.05
  });

  const radius = 25;
  const totalProvinces = provincesData.length;

  // Set up Instanced Meshes
  const totalInstances = totalProvinces;
  const stanchionInstances = totalProvinces * 4;

  const floorLampInstanced = new THREE.InstancedMesh(floorLampGeo, frameMat, totalProvinces * 2);
  floorLampInstanced.castShadow = true;
  scene.add(floorLampInstanced);

  const lampGlowInstanced = new THREE.InstancedMesh(lampGlowGeo, lampGlowMat, totalProvinces * 2);
  scene.add(lampGlowInstanced);

  const stanchionInstanced = new THREE.InstancedMesh(stanchionGeo, frameMat, stanchionInstances);
  stanchionInstanced.castShadow = true;
  scene.add(stanchionInstanced);

  // ---------------------------------
  // NEW INSTANCED MESHES
  // ---------------------------------
  const carpetInstanced = new THREE.InstancedMesh(corridorCarpetGeo, carpetMat, totalInstances);
  carpetInstanced.receiveShadow = true;
  scene.add(carpetInstanced);

  const bannerInstanced = new THREE.InstancedMesh(bannerGeo, bannerMat, totalInstances);
  scene.add(bannerInstanced);

  const bannerPoleInstanced = new THREE.InstancedMesh(bannerPoleGeo, frameMat, totalInstances);
  scene.add(bannerPoleInstanced);

  // Elegant Gallery Spotlight Instanced
  const lampCasingGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.5, 16);
  lampCasingGeo.rotateX(Math.PI / 2);
  const lampCasingMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 });
  const lampCasingInstanced = new THREE.InstancedMesh(lampCasingGeo, lampCasingMat, totalInstances);
  scene.add(lampCasingInstanced);

  const lampBulbGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16);
  lampBulbGeo.rotateX(Math.PI / 2);
  lampBulbGeo.translate(0, 0, 0.25); 
  const lampBulbMat = new THREE.MeshStandardMaterial({ emissive: 0xffffee, emissiveIntensity: 5.0, color: 0x000000 });
  const lampBulbInstanced = new THREE.InstancedMesh(lampBulbGeo, lampBulbMat, totalInstances);
  scene.add(lampBulbInstanced);

  const lampArmGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
  lampArmGeo.translate(0, 1.75, -0.1); 
  const lampArmInstanced = new THREE.InstancedMesh(lampArmGeo, lampCasingMat, totalInstances);
  scene.add(lampArmInstanced);

  // Volumetric Light Beam (Fake Spotlight)
  const lampBeamGeo = new THREE.ConeGeometry(1.6, 5.0, 32, 1, true);
  lampBeamGeo.translate(0, -2.5, 0); 

  const beamCount = lampBeamGeo.attributes.position.count;
  const beamColors = new Float32Array(beamCount * 3);
  for (let j = 0; j < beamCount; j++) {
    const y = lampBeamGeo.attributes.position.getY(j);
    const intensity = Math.pow(Math.max(0, 1.0 - (Math.abs(y) / 5.0)), 2.5);
    beamColors[j * 3] = intensity;
    beamColors[j * 3 + 1] = intensity;
    beamColors[j * 3 + 2] = intensity;
  }
  lampBeamGeo.setAttribute('color', new THREE.BufferAttribute(beamColors, 3));

  lampBeamGeo.rotateX(-Math.PI / 2); 

  const lampBeamMat = new THREE.MeshBasicMaterial({
    color: 0xfff5e6,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
    side: THREE.DoubleSide
  });
  const lampBeamInstanced = new THREE.InstancedMesh(lampBeamGeo, lampBeamMat, totalInstances);
  scene.add(lampBeamInstanced);




  // Portal group components
  const pMat = new THREE.MeshStandardMaterial({
    color: 0x050505, roughness: 0.05, metalness: 0.95, side: THREE.DoubleSide, transparent: true, opacity: 0.95
  });
  const portalSurfaceInstanced = new THREE.InstancedMesh(portalSurfaceGeo, pMat, totalInstances);
  scene.add(portalSurfaceInstanced);

  const portalFrameInstanced = new THREE.InstancedMesh(frameGeo, frameMat, totalInstances);
  scene.add(portalFrameInstanced);

  const pillarInstanced = new THREE.InstancedMesh(gapuraPillarGeo, gapuraMat, totalInstances * 2);
  pillarInstanced.castShadow = true;
  scene.add(pillarInstanced);

  const lintelInstanced = new THREE.InstancedMesh(gapuraLintelGeo, gapuraMat, totalInstances);
  lintelInstanced.castShadow = true;
  scene.add(lintelInstanced);

  // Ropes Instanced
  const ropeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.85, -15),
    new THREE.Vector3(0, 0.3, -18),
    new THREE.Vector3(0, 0.85, -21)
  ]);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 12, 0.025, 8, false);
  const ropeInstanced = new THREE.InstancedMesh(ropeGeo, ropeMat, totalInstances * 2);
  ropeInstanced.castShadow = true;
  scene.add(ropeInstanced);



  const dummy = new THREE.Object3D();
  const portalDummy = new THREE.Object3D();
  let lampIdx = 0;
  let stanchionIdx = 0;
  let ropeIdx = 0;
  let pillarIdx = 0;

  // ExtrudeGeometry Cache for the 4 images
  const cachedExtrudeGeos = {};
  const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.06, bevelThickness: 0.06 };

  provincesData.forEach((prov, i) => {
    const angle = (i / totalProvinces) * Math.PI * 2;
    const posX = Math.sin(angle) * radius;
    const posZ = -Math.cos(angle) * radius;
    const rotY = -angle;

    // Carpet
    dummy.position.set(0, 0.05, 0);
    dummy.rotation.set(-Math.PI / 2, 0, -angle);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    carpetInstanced.setMatrixAt(i, dummy.matrix);

    // Banner & Pole
    const bannerAngle = angle + (Math.PI / totalProvinces);
    const bX = Math.sin(bannerAngle) * 24.9;
    const bZ = -Math.cos(bannerAngle) * 24.9;

    dummy.position.set(bX, 12, bZ);
    dummy.rotation.set(0, -bannerAngle, 0);
    dummy.updateMatrix();
    bannerInstanced.setMatrixAt(i, dummy.matrix);

    dummy.position.set(bX, 16, bZ); // 12 + 4.0
    dummy.rotation.set(0, -bannerAngle, 0);
    dummy.updateMatrix();
    bannerPoleInstanced.setMatrixAt(i, dummy.matrix);



    // Elegant Gallery Spotlight & Volumetric Beam
    dummy.position.set(bX, 12, bZ);
    dummy.rotation.set(0, -bannerAngle, 0);
    dummy.translateY(4.5); // Just above the pole (Y = 16.5)
    dummy.translateZ(1.5); // Pulled back 1.5m to illuminate front surface properly
    dummy.rotateX(2.11); // Tilt ~121 degrees downwards/backwards to point EXACTLY at banner center
    dummy.updateMatrix();
    lampCasingInstanced.setMatrixAt(i, dummy.matrix);
    lampBulbInstanced.setMatrixAt(i, dummy.matrix);

    // Apply the tilted matrix to the beam
    lampBeamInstanced.setMatrixAt(i, dummy.matrix);

    // Arm should point straight up to ceiling, so unrotate the tilt
    dummy.rotateX(-2.11);
    dummy.updateMatrix();
    lampArmInstanced.setMatrixAt(i, dummy.matrix);


    // Picture Frames
    if (i % 2 === 0) {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(bX, 5, bZ);
      frameGroup.rotation.y = -bannerAngle;
      const imgIndex = (i / 2) % 4 + 1;
      const canvasMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const picFrame = new THREE.Mesh(new THREE.BufferGeometry(), picFrameMat);
      frameGroup.add(picFrame);
      const picCanvas = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.2), canvasMat);
      picCanvas.position.z = 0.02;
      frameGroup.add(picCanvas);



      scene.add(frameGroup);

      new THREE.TextureLoader().load(`/gallery/gambar${imgIndex}.jpg`, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        canvasMat.map = texture;
        canvasMat.needsUpdate = true;

        const aspect = texture.image.width / texture.image.height;
        const targetHeight = 3.2;
        const targetWidth = targetHeight * aspect;

        if (!cachedExtrudeGeos[imgIndex]) {
          const shape = new THREE.Shape();
          const frameThickness = 0.25;
          shape.moveTo(-targetWidth / 2 - frameThickness, -targetHeight / 2 - frameThickness);
          shape.lineTo(targetWidth / 2 + frameThickness, -targetHeight / 2 - frameThickness);
          shape.lineTo(targetWidth / 2 + frameThickness, targetHeight / 2 + frameThickness);
          shape.lineTo(-targetWidth / 2 - frameThickness, targetHeight / 2 + frameThickness);
          shape.lineTo(-targetWidth / 2 - frameThickness, -targetHeight / 2 - frameThickness);
          const hole = new THREE.Path();
          hole.moveTo(-targetWidth / 2, -targetHeight / 2);
          hole.lineTo(targetWidth / 2, -targetHeight / 2);
          hole.lineTo(targetWidth / 2, targetHeight / 2);
          hole.lineTo(-targetWidth / 2, targetHeight / 2);
          hole.lineTo(-targetWidth / 2, -targetHeight / 2);
          shape.holes.push(hole);

          cachedExtrudeGeos[imgIndex] = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        }

        picFrame.geometry = cachedExtrudeGeos[imgIndex];
        picCanvas.geometry = new THREE.PlaneGeometry(targetWidth, targetHeight);
      });
    }

    // Floor Lamps & Stanchions & Ropes
    const lampR = 23.5;
    const lampW = 1.6;
    [-1, 1].forEach(side => {
      const w = lampW * side;
      const lX = Math.sin(angle) * lampR + Math.cos(angle) * w;
      const lZ = -Math.cos(angle) * lampR + Math.sin(angle) * w;

      dummy.position.set(lX, 0.6, lZ);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      floorLampInstanced.setMatrixAt(lampIdx, dummy.matrix);

      dummy.position.set(lX, 1.25, lZ);
      dummy.updateMatrix();
      lampGlowInstanced.setMatrixAt(lampIdx, dummy.matrix);
      lampIdx++;
    });

    const stR1 = 15;
    const stR2 = 21;
    const stW = 1.2;
    [-1, 1].forEach(side => {
      const w = stW * side;
      const s1X = Math.sin(angle) * stR1 + Math.cos(angle) * w;
      const s1Z = -Math.cos(angle) * stR1 + Math.sin(angle) * w;

      dummy.position.set(s1X, 0.45, s1Z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      stanchionInstanced.setMatrixAt(stanchionIdx++, dummy.matrix);

      const s2X = Math.sin(angle) * stR2 + Math.cos(angle) * w;
      const s2Z = -Math.cos(angle) * stR2 + Math.sin(angle) * w;

      dummy.position.set(s2X, 0.45, s2Z);
      dummy.updateMatrix();
      stanchionInstanced.setMatrixAt(stanchionIdx++, dummy.matrix);

      // Rope instance
      // The geometry is centered along Z from -15 to -21.
      // We just shift it left/right by w and rotate it by -angle
      dummy.position.set(Math.cos(angle) * w, 0, Math.sin(angle) * w);
      dummy.rotation.set(0, rotY, 0);
      dummy.updateMatrix();
      ropeInstanced.setMatrixAt(ropeIdx++, dummy.matrix);
    });

    // Portal Base Transform
    portalDummy.position.set(posX, doorHeight / 2, posZ);
    portalDummy.rotation.set(0, rotY, 0);
    portalDummy.scale.set(1, 1, 1);
    portalDummy.updateMatrix();

    // Portal Surface
    dummy.copy(portalDummy);
    dummy.translateZ(-0.05);
    dummy.updateMatrix();
    portalSurfaceInstanced.setMatrixAt(i, dummy.matrix);

    // Frame
    portalFrameInstanced.setMatrixAt(i, portalDummy.matrix);

    // Left Pillar
    dummy.copy(portalDummy);
    dummy.translateX(-1.45);
    dummy.translateY(0.3);
    dummy.translateZ(0.1);
    dummy.updateMatrix();
    pillarInstanced.setMatrixAt(pillarIdx++, dummy.matrix);

    // Right Pillar
    dummy.copy(portalDummy);
    dummy.translateX(1.45);
    dummy.translateY(0.3);
    dummy.translateZ(0.1);
    dummy.updateMatrix();
    pillarInstanced.setMatrixAt(pillarIdx++, dummy.matrix);

    // Lintel
    dummy.copy(portalDummy);
    dummy.translateY(2.9);
    dummy.translateZ(0.2);
    dummy.updateMatrix();
    lintelInstanced.setMatrixAt(i, dummy.matrix);

    // UNIQUE Plaque (Cannot be instanced due to unique texture map)
    const plaqueTex = createPlaqueTexture(prov.name);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTex, roughness: 0.2, metalness: 0.9, emissive: 0xffffff, emissiveMap: plaqueTex, emissiveIntensity: 0.5
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.copy(portalDummy.position);
    plaque.position.y += 2.6;

    // Convert local translateZ(0.51) to world
    plaque.position.x += Math.sin(rotY) * 0.51;
    plaque.position.z += Math.cos(rotY) * 0.51;
    plaque.rotation.y = rotY;
    scene.add(plaque);

    // Abstract Portal for Raycaster
    portals.push({
      position: new THREE.Vector3(posX, doorHeight / 2, posZ),
      userData: { id: prov.id, name: prov.name, basePosY: doorHeight / 2 }
    });
  });

  // Trigger update for all instanced meshes
  carpetInstanced.instanceMatrix.needsUpdate = true;
  bannerInstanced.instanceMatrix.needsUpdate = true;
  bannerPoleInstanced.instanceMatrix.needsUpdate = true;
  lampCasingInstanced.instanceMatrix.needsUpdate = true;
  lampBulbInstanced.instanceMatrix.needsUpdate = true;
  lampArmInstanced.instanceMatrix.needsUpdate = true;
  lampBeamInstanced.instanceMatrix.needsUpdate = true;
  portalSurfaceInstanced.instanceMatrix.needsUpdate = true;
  portalFrameInstanced.instanceMatrix.needsUpdate = true;
  pillarInstanced.instanceMatrix.needsUpdate = true;
  lintelInstanced.instanceMatrix.needsUpdate = true;
  ropeInstanced.instanceMatrix.needsUpdate = true;
  floorLampInstanced.instanceMatrix.needsUpdate = true;
  lampGlowInstanced.instanceMatrix.needsUpdate = true;
  stanchionInstanced.instanceMatrix.needsUpdate = true;

  // 6. Pedestals (Center Exhibit)
  const pedestalGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, map: marbleTex, roughness: 0.6, metalness: 0.1 });
  const glassCaseGeo = new THREE.BoxGeometry(1.0, 1.2, 1.0);
  glassCaseGeo.translate(0, 0.6, 0);

  const pedPositions = [
    { x: 5, z: 5, id: 1 }, { x: -5, z: 5, id: 2 }, { x: 5, z: -5, id: 3 }, { x: -5, z: -5, id: 4 }
  ];

  pedPositions.forEach((pos, i) => {
    const pedGroup = new THREE.Group();
    pedGroup.position.set(pos.x, 0, pos.z);

    const ped = new THREE.Mesh(pedestalGeo, pedestalMat);
    ped.position.y = 0.6;
    ped.castShadow = true; ped.receiveShadow = true;
    pedGroup.add(ped);

    const glassCase = new THREE.Mesh(glassCaseGeo, skylightMat);
    glassCase.position.y = 1.2;
    glassCase.userData = { isArtifact: true, id: pos.id };
    pedGroup.add(glassCase);
    interactableCases.push(glassCase);

    const artifactWrapper = new THREE.Group();
    artifactWrapper.position.y = 1.8;
    pedGroup.add(artifactWrapper);
    artifacts.push(artifactWrapper);

    scene.add(pedGroup);
  });

  return { portals, artifacts, pillarPositions, interactableCases, createdPlaqueTextures };
}
