import * as THREE from 'three';

export function createKawungTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 12;
  const size = 128;
  for (let y = 0; y <= 512; y += size) {
    for (let x = 0; x <= 512; x += size) {
      ctx.beginPath(); ctx.arc(x, y, size * 0.6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createMarbleTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fdfdfd'; ctx.fillRect(0, 0, 1024, 1024);

  const drawVeins = (count, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      let x = Math.random() * 1024, y = Math.random() * 1024;
      ctx.moveTo(x, y);
      for (let j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 400; y += (Math.random() - 0.5) * 400;
        ctx.bezierCurveTo(x + 50, y - 50, x - 50, y + 50, x, y);
      }
      ctx.stroke();
    }
  };

  drawVeins(30, 4, '#c0c0c0'); 
  drawVeins(60, 2, '#d8d8d8'); 
  drawVeins(80, 1, '#eaeaea'); 

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(8, 8);
  if (renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export function createFlutedTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 2; 
  const ctx = canvas.getContext('2d');
  const numFlutes = 16; 
  for (let i = 0; i < numFlutes; i++) {
    const startX = (i / numFlutes) * 512;
    const endX = ((i + 1) / numFlutes) * 512;
    const gradient = ctx.createLinearGradient(startX, 0, endX, 0);
    gradient.addColorStop(0, '#888888'); 
    gradient.addColorStop(0.2, '#ffffff'); 
    gradient.addColorStop(0.8, '#ffffff'); 
    gradient.addColorStop(1, '#888888'); 
    ctx.fillStyle = gradient;
    ctx.fillRect(startX, 0, endX - startX, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createWoodTexture(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 0, 512, 512);

  ctx.lineWidth = 2;
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * 512;
    ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    for(let j=0; j<512; j+=20) {
       ctx.lineTo(j, y + Math.sin(j * 0.05) * 3);
    }
    ctx.stroke();
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (renderer) tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

export function createStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base dark grey/greenish stone color
  ctx.fillStyle = '#2c302e';
  ctx.fillRect(0, 0, 512, 512);

  // Add noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw some random cracks
  ctx.strokeStyle = 'rgba(10,10,10,0.5)';
  ctx.lineWidth = 2;
  for(let i=0; i<30; i++) {
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for(let j=0; j<5; j++) {
      x += (Math.random() - 0.5) * 100;
      y += (Math.random() - 0.5) * 100;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}


export function buildCaveLighting(scene) {
  // Langit-langit gelap tapi hangat (warm brown/amber), tanah coklat gelap
  const hemiLight = new THREE.HemisphereLight(0x5a4a3a, 0x3a2a1a, 2.0);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // Tambahkan sedikit cahaya ambient agar dinding terlihat teksturnya
  const ambientLight = new THREE.AmbientLight(0x453525, 1.5);
  scene.add(ambientLight);

  // Cahaya 'Fill' di tengah atap khusus untuk menerangi dedaunan gantung (Warm light)
  // Menggunakan PointLight dengan jangkauan terbatas (distance: 15) agar tidak merusak dramatisasi lantai
  const leafLight = new THREE.PointLight(0xcca888, 200.0, 15, 2);
  leafLight.position.set(0, 9, 0); // Tepat di bawah atap (roomH = 10)
  scene.add(leafLight);

  // Lampu pintu masuk / area spawn (tanpa bayangan untuk optimasi)
  const spawnLight = new THREE.PointLight(0xffddaa, 100.0, 10, 2);
  spawnLight.position.set(0, 6, 12); 
  scene.add(spawnLight);
}

export function buildLighting(scene) {
  // 1. Hemisphere Light (Sky is white, Ground is WARM GOLD)
  // This completely replaces the need for 4 separate PointLights on the walls
  // It gives the exact same warm ambient glow from the floor up!
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xeeeeee, 0.6);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // 2. The beloved Angled Directional Light (Restored from old version)
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(10, 50, 10);
  dirLight.target.position.set(0, 0, 0);
  dirLight.castShadow = true;
  // Reduced map size for 60 FPS, the visual difference is negligible due to soft shadows
  dirLight.shadow.mapSize.width = 1024; 
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 80;
  dirLight.shadow.camera.left = -30;
  dirLight.shadow.camera.right = 30;
  dirLight.shadow.camera.top = 30;
  dirLight.shadow.camera.bottom = -30;
  dirLight.shadow.camera.updateProjectionMatrix(); 
  dirLight.shadow.bias = -0.0001;
  dirLight.shadow.normalBias = 0.02;
  dirLight.shadow.radius = 4;
  scene.add(dirLight);
  scene.add(dirLight.target);

  // 3. Central Highlight (Replaces 4 overlapping SpotLights)
  // 1 PointLight provides the same illumination to the 4 pedestals without 4x GPU cost
  const centerAccent = new THREE.PointLight(0xfffaee, 4.0, 35);
  centerAccent.position.set(0, 18, 0);
  scene.add(centerAccent);

  // 4. Fake SpotLight Fixtures (Keeps the physical lamps visible from old version)
  const spotPositions = [
    { x: 12, z: 12 }, { x: -12, z: 12 },
    { x: 12, z: -12 }, { x: -12, z: -12 }
  ];
  spotPositions.forEach(pos => {
    const lampGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: 0xfffaee,
      emissiveIntensity: 5
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(pos.x, 19.9, pos.z);
    scene.add(lamp);
  });
}

export function buildParticles(scene) {
  // Floating Dust Particles
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 500; 
  const posArray = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 60; // Spread across 60x60x60
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  
  const particlesMat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0xaaaaaa,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  
  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  particlesMesh.position.y = 10;
  scene.add(particlesMesh);
  
  return particlesMesh;
}
