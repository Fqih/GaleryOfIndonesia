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

export function buildLighting(scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xeeeeee, 0.6);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(10, 50, 10);
  dirLight.target.position.set(0, 0, 0);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
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

  const accentPositions = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    accentPositions.push({ x: Math.sin(angle) * 24, z: Math.cos(angle) * 24 });
  }
  accentPositions.forEach(pos => {
    const accentLight = new THREE.PointLight(0xffddaa, 1.5, 30);
    accentLight.position.set(pos.x, 15, pos.z);
    scene.add(accentLight);
  });

  const spotPositions = [
    { x: 12, z: 12 }, { x: -12, z: 12 },
    { x: 12, z: -12 }, { x: -12, z: -12 }
  ];
  spotPositions.forEach(pos => {
    const spotLight = new THREE.SpotLight(0xfffaee, 150.0, 40, Math.PI / 6, 0.5, 2);
    spotLight.position.set(pos.x, 19.8, pos.z); 
    spotLight.target.position.set(pos.x, 0, pos.z);
    scene.add(spotLight);
    scene.add(spotLight.target);

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
