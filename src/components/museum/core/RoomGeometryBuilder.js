import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createStoneTexture } from './EnvironmentBuilder.js';
import { getGLTFLoader } from './ModelLoader.js';

// --- TEXTURES ---
const stoneTex = createStoneTexture();

// --- CACHED GEOMETRIES & MATERIALS ---
export const ROOM_W = 20;
export const ROOM_H = 10;
export const ROOM_D = 30; // Diperpanjang menjadi balok persegi panjang (sedang)

// --- LIGHTING CONSTANTS (Sumber kebenaran tunggal untuk seluruh PointLight/SpotLight di region) ---
export const MUSEUM_LIGHT_COLOR     = 0xff9040; // Warm amber — tema gua
export const MUSEUM_LIGHT_INTENSITY = 80.0;
export const MUSEUM_LIGHT_DISTANCE  = 15;
export const MUSEUM_LIGHT_DECAY     = 2.0;

// Geometries
const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
const ceilGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
const wallGeoX = new THREE.PlaneGeometry(ROOM_D, ROOM_H); // Left/Right
const wallGeoZ = new THREE.PlaneGeometry(ROOM_W, ROOM_H); // Front/Back

// Cave Stone Material
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  map: stoneTex,
  bumpMap: stoneTex,
  bumpScale: 0.5,
  roughness: 1.0,
  metalness: 0.0
});

// Pedestal Kayu Natural / Batu
const pedGeo = new THREE.CylinderGeometry(0.8, 1, 1.2, 32);
const pedMat = new THREE.MeshStandardMaterial({ color: 0x334433, roughness: 0.9, bumpMap: stoneTex });

const caseGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
const caseMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.1, metalness: 0.5, depthWrite: false
});

const hitGeo = new THREE.BoxGeometry(2, 3.5, 2);
const hitMat = new THREE.MeshBasicMaterial({ visible: false });

// --- Pintu Bertekstur (3D) ---
const woodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 }); // Kayu gelap
const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a1a17, roughness: 0.9 }); // Kusen lebih gelap
const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.8 }); // Gagang emas

const frameSideGeo = new THREE.BoxGeometry(0.3, 5.2, 0.4);
const frameTopGeo = new THREE.BoxGeometry(3.6, 0.3, 0.4);
const panelGeo = new THREE.BoxGeometry(3, 5, 0.15);
const innerPanelGeo = new THREE.BoxGeometry(2.2, 1.8, 0.18); // Aksen timbul
const knobGeo = new THREE.SphereGeometry(0.08, 16, 16);

const doorHitGeo = new THREE.BoxGeometry(4, 6, 2);
const doorHitMat = new THREE.MeshBasicMaterial({ visible: false });

// --- HELPERS ---
function createTextCanvasTexture(title, subtitle, description) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#2c1c11'; // Kayu gelap
  ctx.fillRect(0, 0, 1024, 1024);

  // Border
  ctx.strokeStyle = '#d4af37'; // Emas
  ctx.lineWidth = 20;
  ctx.strokeRect(10, 10, 1004, 1004);

  // Title
  ctx.fillStyle = '#f5deb3';
  ctx.font = 'bold 70px serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 512, 130);

  // Subtitle
  if (subtitle) {
    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 40px serif';
    ctx.fillText(subtitle, 512, 200);
  }

  // Description
  ctx.font = '35px sans-serif';
  ctx.fillStyle = '#ffffff';
  
  const textStr = Array.isArray(description) ? description.join('\n\n') : (description || '');
  const paragraphs = textStr.split('\n');
  
  let y = subtitle ? 280 : 220;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 900 && n > 0) {
        ctx.fillText(line, 512, y);
        line = words[n] + ' ';
        y += 50;
        if (y > 980) break; // Cukupkan jika teks kepanjangan
      } else {
        line = testLine;
      }
    }
    if (y > 980) break;
    ctx.fillText(line, 512, y);
    y += 70; // Spasi antar paragraf
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16; // Meningkatkan ketajaman teks saat dilihat dari sudut miring
  return texture;
}

export function buildRegionalRoomGeometry(scene, regionData) {
  const interactables = {
    portals: [],
    artifacts: [],
    interactableCases: []
  };

  const loader = getGLTFLoader();

  // 1. Lantai Gua
  const floor = new THREE.Mesh(floorGeo, stoneMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 1b. Jalur Kayu (Wooden Boardwalk — Bentuk T) [DIOPTIMASI: InstancedMesh + mergeGeometries]
  const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0x5c3212, roughness: 0.95, metalness: 0.0 });
  const railMat      = new THREE.MeshStandardMaterial({ color: 0x3b1f0a, roughness: 1.0,  metalness: 0.0 });
  const _dummy = new THREE.Object3D(); // Reusable dummy untuk InstancedMesh

  // --- Jalur Tengah: z=13 → z=-9 ---
  // Rel: mergeGeometries → 1 draw call untuk 2 rel
  const mainRailGeo = new THREE.BoxGeometry(0.12, 0.1, 22);
  const railGeoL = mainRailGeo.clone(); railGeoL.translate(-1.6, 0.05, 2);
  const railGeoR = mainRailGeo.clone(); railGeoR.translate( 1.6, 0.05, 2);
  const mergedMainRails = BufferGeometryUtils.mergeGeometries([railGeoL, railGeoR]);
  scene.add(new THREE.Mesh(mergedMainRails, railMat));

  // Bilah tengah: 44 mesh → 1 InstancedMesh
  const plankGeo = new THREE.BoxGeometry(3.2, 0.07, 0.28);
  const plankInstanced = new THREE.InstancedMesh(plankGeo, woodFloorMat, 44);
  plankInstanced.castShadow = false;
  plankInstanced.receiveShadow = true;
  for (let i = 0; i < 44; i++) {
    _dummy.position.set(0, 0.035, 13 - i * 0.5);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    plankInstanced.setMatrixAt(i, _dummy.matrix);
  }
  plankInstanced.instanceMatrix.needsUpdate = true;
  scene.add(plankInstanced);

  // --- Cabang Kiri+Kanan di z=0 ---
  // Rel cabang: mergeGeometries → 1 draw call untuk 4 rel
  const branchRailGeo = new THREE.BoxGeometry(7.9, 0.1, 0.12);
  const brGeoLL = branchRailGeo.clone(); brGeoLL.translate(-6.75, 0.05, -1.6);
  const brGeoLR = branchRailGeo.clone(); brGeoLR.translate(-6.75, 0.05,  1.6);
  const brGeoRL = branchRailGeo.clone(); brGeoRL.translate( 6.75, 0.05, -1.6);
  const brGeoRR = branchRailGeo.clone(); brGeoRR.translate( 6.75, 0.05,  1.6);
  const mergedBranchRails = BufferGeometryUtils.mergeGeometries([brGeoLL, brGeoLR, brGeoRL, brGeoRR]);
  scene.add(new THREE.Mesh(mergedBranchRails, railMat));

  // Bilah cabang: 32 mesh → 1 InstancedMesh (16 kiri + 16 kanan)
  const branchPlankGeo = new THREE.BoxGeometry(0.28, 0.07, 3.2);
  const branchInstanced = new THREE.InstancedMesh(branchPlankGeo, woodFloorMat, 32);
  branchInstanced.castShadow = false;
  branchInstanced.receiveShadow = true;
  for (let i = 0; i < 16; i++) {
    _dummy.position.set(-9.5 + i * 0.5, 0.035, 0);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    branchInstanced.setMatrixAt(i, _dummy.matrix);
    _dummy.position.set(9.5 - i * 0.5, 0.035, 0);
    _dummy.updateMatrix();
    branchInstanced.setMatrixAt(16 + i, _dummy.matrix);
  }
  branchInstanced.instanceMatrix.needsUpdate = true;
  scene.add(branchInstanced);

  // --- Obor Statis [DIOPTIMASI: segmen 8→6, PointLight 16→6 (shared per pasang)] ---
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x3b1f0a, roughness: 1.0 });
  const flameMat  = new THREE.MeshStandardMaterial({
    color: 0xff4400, emissive: 0xff6600, emissiveIntensity: 2.5, roughness: 0.8
  });
  const handleGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.8, 6);
  const baseGeo   = new THREE.CylinderGeometry(0.08, 0.09, 0.12, 6);
  const flameGeo  = new THREE.BoxGeometry(0.14, 0.22, 0.14); // Persegi, bukan kerucut

  // Pasangan obor jalur tengah: skip 1 → dari 6 menjadi 3 pasang (z=12, 4, -8)
  const torchZPositions = [12, 4, -8];
  torchZPositions.forEach(tz => {
    [-2.2, 2.2].forEach(tx => {
      const torchGroup = new THREE.Group();
      const base   = new THREE.Mesh(baseGeo, handleMat); base.position.set(0, 0.06, 0);
      const handle = new THREE.Mesh(handleGeo, handleMat); handle.position.set(0, 0.52, 0); // 0.58→0.52 agar menyatu
      const flame  = new THREE.Mesh(flameGeo, flameMat);  flame.position.set(0, 1.03, 0);
      torchGroup.add(base, handle, flame);
      torchGroup.position.set(tx, 0.0, tz);
      scene.add(torchGroup);
    });
    // 1 PointLight di tengah (x=0) per pasang — bukan 2 light individual
    const torchLight = new THREE.PointLight(0xff6600, 28.0, 5, 2);
    torchLight.castShadow = false;
    torchLight.position.set(0, 1.2, tz);
    scene.add(torchLight);
  });

  // Obor ujung cabang board — hanya mesh visual, tanpa PointLight (emissive cukup)
  [[-9.5, 1.8], [-9.5, -1.8], [9.5, 1.8], [9.5, -1.8]].forEach(([bx, bz]) => {
    const torchGroup = new THREE.Group();
    const base2   = new THREE.Mesh(baseGeo,   handleMat); base2.position.set(0, 0.06, 0);
    const handle2 = new THREE.Mesh(handleGeo, handleMat); handle2.position.set(0, 0.52, 0); // fix gap
    const flame2  = new THREE.Mesh(flameGeo,  flameMat);  flame2.position.set(0, 1.03, 0);
    torchGroup.add(base2, handle2, flame2);
    torchGroup.position.set(bx, 0.0, bz);
    scene.add(torchGroup);
    // Tidak ada PointLight — area board sudah terang dari entranceLight
  });


  // 2. Langit-langit (Ceiling) Gua
  const ceiling = new THREE.Mesh(ceilGeo, stoneMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_H;
  scene.add(ceiling);

  // 3. Tembok (Walls) Gua
  const wallN = new THREE.Mesh(wallGeoZ, stoneMat);
  wallN.position.set(0, ROOM_H / 2, -ROOM_D / 2);
  wallN.receiveShadow = true;
  scene.add(wallN);

  const wallS = new THREE.Mesh(wallGeoZ, stoneMat);
  wallS.rotation.y = Math.PI;
  wallS.position.set(0, ROOM_H / 2, ROOM_D / 2);
  wallS.receiveShadow = true;
  scene.add(wallS);

  const wallW = new THREE.Mesh(wallGeoX, stoneMat);
  wallW.rotation.y = Math.PI / 2;
  wallW.position.set(-ROOM_W / 2, ROOM_H / 2, 0);
  wallW.receiveShadow = true;
  scene.add(wallW);

  const wallE = new THREE.Mesh(wallGeoX, stoneMat);
  wallE.rotation.y = -Math.PI / 2;
  wallE.position.set(ROOM_W / 2, ROOM_H / 2, 0);
  wallE.receiveShadow = true;
  scene.add(wallE);

  // 4. Foliage: Tanaman Rambat Asli (GLB Model)
  // Kita meload vines.glb secara asinkron lalu mendistribusikannya di atap
  loader.load(
    '/models/vines.glb',
    (gltf) => {
      const vinesBase = gltf.scene;

      // Ekstraksi bagian per bagian daun dari "katalog" GLB
      let pieces = gltf.scene.children.filter(c => c.isMesh || c.isGroup);

      // Jika model dibungkus dalam 1 RootNode, kita ambil anak-anaknya agar benar-benar terpisah
      if (pieces.length === 1 && pieces[0].children.length > 0) {
        pieces = pieces[0].children;
      }

      // Jika masih ada subgroup (Sketchfab format), kita pastikan terurai
      const finalPieces = [];
      pieces.forEach(p => {
        if (p.children.length > 0) {
          p.children.forEach(child => finalPieces.push(child));
        } else {
          finalPieces.push(p);
        }
      });

      // Jika kosong, pakai yang ada
      const vineTemplates = finalPieces.length > 0 ? finalPieces : [gltf.scene];

      vineTemplates.forEach(p => {
        p.traverse(c => {
          if (c.isMesh) {
            c.castShadow = false;
            c.receiveShadow = false;
            if (c.material && c.material.emissive) {
              c.material.emissive.setHex(0x112211);
              c.material.emissiveIntensity = 0.5;
            }
          }
        });
      });

      // Kita buat menyebar rapat membentuk pola PERSEGI PANJANG menyusuri tembok atap
      const vineY = 9.5;
      const numVines = 24; // Dikurangi dari 48 menjadi 24 untuk optimasi overdraw / polygon count GPU
      const limitX = ROOM_W / 2 - 0.5; // 9.5
      const limitZ = ROOM_D / 2 - 0.5; // 19.5

      // 1. Persiapkan data template dan ukurannya
      const templateData = vineTemplates.map(template => {
        const meshes = [];
        template.traverse(c => {
          if (c.isMesh) meshes.push(c);
        });

        // Hitung batas ukuran
        const box = new THREE.Box3().setFromObject(template);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const baseScale = maxDim > 0 ? (5 / maxDim) : 2.0;

        // Titik tengah untuk pivot
        const center = box.getCenter(new THREE.Vector3());

        return { meshes, baseScale, center, root: template };
      });

      // 2. Buat InstancedMesh untuk setiap sub-mesh di dalam template
      const instancedMeshesData = templateData.map((tm, tIdx) => {
        // Hitung berapa kali template ini akan muncul di lingkaran
        let count = 0;
        for (let i = 0; i < numVines; i++) {
          if (i % templateData.length === tIdx) count++;
        }

        return tm.meshes.map(m => {
          const im = new THREE.InstancedMesh(m.geometry, m.material, count);
          im.castShadow = false;
          im.receiveShadow = false;
          scene.add(im);
          return { im, counter: 0, originalMesh: m };
        });
      });

      // 3. Kalkulasi dan pasang Matrix Transform
      const dummyParent = new THREE.Object3D();
      const tempMatrix = new THREE.Matrix4();
      const localMatrix = new THREE.Matrix4();

      for (let i = 0; i < numVines; i++) {
        if (templateData.length === 0) break;

        const tIndex = i % templateData.length;
        const tm = templateData[tIndex];
        const imsDataList = instancedMeshesData[tIndex];

        // Proporsi penyebaran berdasarkan keliling (perimeter) persegi panjang
        const lenX = limitX * 2;
        const lenZ = limitZ * 2;
        const totalPerimeter = lenX * 2 + lenZ * 2;

        const p = i / numVines;
        const dist = p * totalPerimeter; // Jarak rambat saat ini

        let vx, vz, baseRotY;

        if (dist < lenX) {
          // Sisi Belakang (Z negative)
          const t = dist / lenX;
          vx = -limitX + (t * lenX);
          vz = -limitZ;
          baseRotY = -Math.PI / 2; // Menjalar sejajar tembok
        } else if (dist < lenX + lenZ) {
          // Sisi Kanan (X positive)
          const t = (dist - lenX) / lenZ;
          vx = limitX;
          vz = -limitZ + (t * lenZ);
          baseRotY = 0;
        } else if (dist < lenX * 2 + lenZ) {
          // Sisi Depan dekat Portal (Z positive)
          const t = (dist - lenX - lenZ) / lenX;
          vx = limitX - (t * lenX);
          vz = limitZ;
          baseRotY = Math.PI / 2;
        } else {
          // Sisi Kiri (X negative)
          const t = (dist - lenX * 2 - lenZ) / lenZ;
          vx = -limitX;
          vz = limitZ - (t * lenZ);
          baseRotY = Math.PI;
        }

        // Posisikan "Grup Pembungkus" palsu di sudut-sudut tembok gua
        dummyParent.position.set(vx, vineY, vz);
        dummyParent.rotation.set(
          (Math.random() - 0.5) * 0.3,
          baseRotY + (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3
        );
        const randScale = tm.baseScale * (0.8 + Math.random() * 0.4);
        dummyParent.scale.setScalar(randScale);
        dummyParent.updateMatrixWorld(true);

        // Pasang matrix untuk setiap sub-mesh ke dalam InstancedMesh miliknya
        imsDataList.forEach((idata) => {
          const m = idata.originalMesh;

          // Kalkulasi matriks lokal mesh tersebut (relatif terhadap root template), dikurangi titik tengah agar pivotnya pas
          localMatrix.identity();
          localMatrix.makeTranslation(m.position.x - tm.center.x, m.position.y - tm.center.y, m.position.z - tm.center.z);

          // Mengalikan rotasi dan skala lokal dari model
          const rotMat = new THREE.Matrix4().makeRotationFromEuler(m.rotation);
          const scaleMat = new THREE.Matrix4().scale(m.scale);
          localMatrix.multiply(rotMat).multiply(scaleMat);

          // Kalikan transformasi global gua (dummyParent) dengan transformasi lokal daun
          tempMatrix.multiplyMatrices(dummyParent.matrixWorld, localMatrix);

          idata.im.setMatrixAt(idata.counter, tempMatrix);
          idata.counter++;
        });
      }

      // Pastikan GPU memperbarui instanced matrices
      instancedMeshesData.forEach(imsDataList => {
        imsDataList.forEach(idata => {
          idata.im.instanceMatrix.needsUpdate = true;
        });
      });
    },
    undefined,
    (err) => console.warn("Vines GLB tidak ditemukan:", err)
  );

  // 5. Pintu Keluar ke Lobby (Model 3D Lebih Detail)
  const doorGroup = new THREE.Group();
  
  // Kusen (Frame)
  const leftFrame = new THREE.Mesh(frameSideGeo, frameMat);
  leftFrame.position.set(-1.65, 2.6, 0);
  const rightFrame = new THREE.Mesh(frameSideGeo, frameMat);
  rightFrame.position.set(1.65, 2.6, 0);
  const topFrame = new THREE.Mesh(frameTopGeo, frameMat);
  topFrame.position.set(0, 5.05, 0);
  
  doorGroup.add(leftFrame, rightFrame, topFrame);

  // Daun Pintu (Door Panel)
  const doorPanel = new THREE.Mesh(panelGeo, woodMat);
  doorPanel.position.set(0, 2.5, 0);
  
  // Aksen Kotak Dalam (Panels)
  const topInner = new THREE.Mesh(innerPanelGeo, woodMat);
  topInner.position.set(0, 1.2, 0); // Relatif terhadap titik tengah panel
  const bottomInner = new THREE.Mesh(innerPanelGeo, woodMat);
  bottomInner.position.set(0, -1.2, 0); 
  
  // Gagang Pintu (Doorknob)
  const knob = new THREE.Mesh(knobGeo, metalMat);
  knob.position.set(-1.2, 0, 0.1); // Di sisi kiri (saat berbalik akan ada di kanan pemain)

  doorPanel.add(topInner, bottomInner, knob);
  doorGroup.add(doorPanel);

  // Posisikan seluruh pintu di dinding
  doorGroup.position.set(0, 0, ROOM_D / 2 - 0.1);
  doorGroup.rotation.y = Math.PI; // Menghadap ke dalam ruangan
  scene.add(doorGroup);

  // Hitbox untuk raycaster portal (Tidak terlihat, tidak merusak fungsi lama)
  const doorHitbox = new THREE.Mesh(doorHitGeo, doorHitMat);
  doorHitbox.position.set(0, 3, ROOM_D / 2 - 1);
  doorHitbox.userData = { isPortal: true, id: 'main', portalName: 'Kembali ke Lobby' };
  scene.add(doorHitbox);
  interactables.portals.push(doorHitbox);

  // Lampu Tambahan di Tengah Area Masuk (Diberi Rongga dari Lampion & Pintu)
  // z=6 = posisi tengah antara area artefak (z≈-2) dan pintu (z=15)
  // Y=4.5 agar setara tinggi lampion — tidak wash-out di langit-langit
  const entranceLight = new THREE.PointLight(MUSEUM_LIGHT_COLOR, MUSEUM_LIGHT_INTENSITY, MUSEUM_LIGHT_DISTANCE, MUSEUM_LIGHT_DECAY);
  entranceLight.position.set(0, 4.5, 6);
  entranceLight.castShadow = false;
  scene.add(entranceLight);

  // 6. Spawn Artifacts dari regionData
  const artifactsData = regionData.artifacts || [];
  artifactsData.forEach((config, idx) => {
    // Spotlight Dramatis Museum — warna warm amber selaras dengan lampion
    const spotLight = new THREE.SpotLight(MUSEUM_LIGHT_COLOR, 150.0);
    
    if (config.type === 'board') {
      // Geser spotlight ke depan papan agar menyorot teks
      spotLight.position.set(config.x * 0.6, 8, config.z !== 0 ? config.z * 0.6 : 3);
      spotLight.target.position.set(config.x, 3.5, config.z);
    } else {
      spotLight.position.set(config.x, 8, config.z);
      spotLight.target.position.set(config.x, 0, config.z);
    }
    
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.8;
    spotLight.decay = 2.0;
    spotLight.distance = 15; // Sedikit ditambah untuk papan
    spotLight.castShadow = false; // Shadow dimatikan untuk optimasi performa
    scene.add(spotLight);
    scene.add(spotLight.target);

    const wrapper = new THREE.Group();
    scene.add(wrapper);

    // Hitbox Artefak
    const hitbox = new THREE.Mesh(hitGeo, hitMat);
    hitbox.userData = {
      isArtifact: true,
      id: config.id,
      artifactName: config.title
    };

    if (config.type === 'board') {
      // Papan Berdiri (Group agar posisi stand konsisten relatif terhadap papan yang dirotasi)
      const boardGroup = new THREE.Group();
      boardGroup.position.set(config.x, 3.5, config.z);

      const standGeo = new THREE.BoxGeometry(0.2, 4, 0.2);
      const standMesh = new THREE.Mesh(standGeo, pedMat);
      // Letakkan stand di bawah tengah papan (Y = 2.0 dunia -> -1.5 lokal) dan di belakang (Z = -0.15)
      standMesh.position.set(0, -1.5, -0.15);
      boardGroup.add(standMesh);

      const boardGeo = new THREE.BoxGeometry(4, 3, 0.1);
      const tex = createTextCanvasTexture(config.title, config.subtitle, config.description);
      const boardMatFront = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
      const materials = [pedMat, pedMat, pedMat, pedMat, boardMatFront, pedMat];
      
      const boardMesh = new THREE.Mesh(boardGeo, materials);
      boardMesh.position.set(0, 0, 0);
      boardGroup.add(boardMesh);

      // Rotasi grup (board + stand) agar tepat menghadap ke tengah ruangan
      boardGroup.lookAt(0, 3.5, 0);
      scene.add(boardGroup);

      hitbox.position.set(config.x, 2.5, config.z);
      scene.add(hitbox);
      interactables.interactableCases.push(hitbox);
    } else {
      // Meja Maket Besar untuk Rumah Adat
      const bigPedGeo = new THREE.BoxGeometry(4, 1.2, 4);
      const ped = new THREE.Mesh(bigPedGeo, pedMat);
      ped.position.set(config.x, 0.6, config.z);
      ped.receiveShadow = true;
      ped.castShadow = true;
      scene.add(ped);

      // Kaca Pelindung Besar
      const bigCaseGeo = new THREE.BoxGeometry(3.8, 3, 3.8);
      const glassCase = new THREE.Mesh(bigCaseGeo, caseMat);
      glassCase.position.set(config.x, 2.7, config.z);
      glassCase.userData = { id: config.id };
      scene.add(glassCase);
      interactables.interactableCases.push(glassCase);

      wrapper.position.set(config.x, 1.2, config.z); // Di atas meja maket
      
      hitbox.position.set(config.x, 2.5, config.z);
      scene.add(hitbox);
    }

    interactables.artifacts.push({ wrapper, hitbox, id: config.id, index: idx, type: config.type || 'model', modelPath: config.modelPath });
  });

  // 7. Shiplamp (Lampion Kuno) Dekorasi + Pencahayaan
  loader.load(
    '/models/ship_lamp.glb',
    (gltf) => {
      const lampBase = gltf.scene;
      lampBase.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false; // Disable castShadow agar lampion tidak mencetak bayangan hitam raksasa ke dinding
          c.receiveShadow = true;
        }
      });
      // Skala lampion
      lampBase.scale.setScalar(0.8);

      // Posisi lampion diletakkan menempel di masing-masing tembok
      // Tembok kiri: x=-10, tembok kanan: x=10, tembok belakang: z=-15 (ROOM_D/2=15)
      const lampPositions = [
        { x: -9.8, y: 3.5, z: -2,    rotY: Math.PI / 2 },  // Tembok Kiri (x≈-10)
        { x: 9.8,  y: 3.5, z: -2,    rotY: -Math.PI / 2 }, // Tembok Kanan (x≈10)
        { x: 0,    y: 3.5, z: -14.8, rotY: 0 },             // Tembok Belakang (z≈-15)
      ];

      lampPositions.forEach((pos) => {
        const lamp = lampBase.clone();
        lamp.position.set(pos.x, pos.y, pos.z);
        lamp.rotation.y = pos.rotY;
        scene.add(lamp);

        // PointLight hangat untuk mensimulasikan api lampion — warna diselaraskan
        const light = new THREE.PointLight(MUSEUM_LIGHT_COLOR, MUSEUM_LIGHT_INTENSITY, MUSEUM_LIGHT_DISTANCE, MUSEUM_LIGHT_DECAY);

        // Arahkan cahaya sedikit menjauhi tembok tempat ia menempel
        let offsetX = 0; let offsetZ = 0;
        if (pos.x < -9) offsetX = 0.3;
        if (pos.x > 9) offsetX = -0.3;
        if (pos.z < -9) offsetZ = 0.3;

        light.position.set(pos.x + offsetX, pos.y + 0.3, pos.z + offsetZ);

        light.castShadow = false; // Shadow dimatikan untuk optimasi performa FPS
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.bias = -0.005;
        scene.add(light);
      });
    },
    undefined,
    (err) => console.warn("Shiplamp tidak ditemukan:", err)
  );

  return interactables;
}
