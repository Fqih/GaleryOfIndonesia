import * as THREE from 'three';

export const floorMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.1, metalness: 0.1 });
export const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
export const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });

export function createLandmarkGeometry(type, colorHex) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.7, metalness: 0.1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
  let m1, m2;

  switch (type) {
    case 'monas': m1 = new THREE.Mesh(new THREE.BoxGeometry(0.8,3,0.8), mat); m1.position.y=1.5; m2 = new THREE.Mesh(new THREE.ConeGeometry(0.5,1,4), goldMat); m2.position.y=3.5; group.add(m1,m2); break;
    case 'gadang': m1 = new THREE.Mesh(new THREE.BoxGeometry(2,1,1), mat); m1.position.y=0.5; m2 = new THREE.Mesh(new THREE.ConeGeometry(1.2,1.5,4), mat); m2.scale.set(1,0.5,0.3); m2.position.set(0,1.2,0); const h1=m2.clone(); h1.position.set(-0.8,1.4,0); h1.rotation.z=Math.PI/4; const h2=m2.clone(); h2.position.set(0.8,1.4,0); h2.rotation.z=-Math.PI/4; group.add(m1,m2,h1,h2); break;
    case 'honai': m1 = new THREE.Mesh(new THREE.CylinderGeometry(1,1,1.2,16), mat); m1.position.y=0.6; m2 = new THREE.Mesh(new THREE.SphereGeometry(1.2,16,16,0,Math.PI*2,0,Math.PI/2), mat); m2.position.y=1.2; group.add(m1,m2); break;
    case 'tugu': m1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.5,2,8), mat); m1.position.y=1; m2 = new THREE.Mesh(new THREE.ConeGeometry(0.3,0.6,8), goldMat); m2.position.y=2.3; group.add(m1,m2); break;
    case 'sate': m1 = new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,1), mat); m1.position.y=0.75; m2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1), goldMat); m2.position.y=1.8; const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15), mat); ball.position.y=2.3; group.add(m1,m2,ball); break;
    case 'gapura': m1 = new THREE.Mesh(new THREE.BoxGeometry(0.8,2.5,0.8), mat); m1.position.set(-0.6,1.25,0); m2 = new THREE.Mesh(new THREE.BoxGeometry(0.8,2.5,0.8), mat); m2.position.set(0.6,1.25,0); group.add(m1,m2); break;
    case 'lamin': m1 = new THREE.Mesh(new THREE.BoxGeometry(3,1,1.5), mat); m1.position.y=0.8; m2 = new THREE.Mesh(new THREE.ConeGeometry(2,1,4), mat); m2.scale.set(1,1,0.5); m2.position.set(0,1.8,0); m2.rotation.y=Math.PI/4; group.add(m1,m2); break;
    case 'tongkonan': m1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat); m1.position.y=0.5; m2 = new THREE.Mesh(new THREE.TorusGeometry(1.5,0.3,8,24,Math.PI), mat); m2.rotation.x=-Math.PI/2; m2.position.set(0,1.2,0); group.add(m1,m2); break;
    case 'pendopo': m1 = new THREE.Mesh(new THREE.BoxGeometry(2.5,0.2,2.5), mat); m1.position.y=0.1; m2 = new THREE.Mesh(new THREE.ConeGeometry(1.8,1.2,4), goldMat); m2.rotation.y=Math.PI/4; m2.position.y=1.5; group.add(m1,m2); break;
    case 'house': m1 = new THREE.Mesh(new THREE.BoxGeometry(2,1,2), mat); m1.position.y=0.5; m2 = new THREE.Mesh(new THREE.ConeGeometry(1.8,1,4), mat); m2.rotation.y=Math.PI/4; m2.position.y=1.5; group.add(m1,m2); break;
    case 'pakaian': m1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,1.5,16), mat); m1.position.y=0.75; m2 = new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16), goldMat); m2.position.y=1.8; group.add(m1,m2); break;
    case 'senjata': m1 = new THREE.Mesh(new THREE.BoxGeometry(0.1,1.8,0.3), mat); m1.position.y=1; m1.rotation.z=Math.PI/8; m2 = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.4,0.4), woodMat); m2.position.set(-0.2,0.2,0); m2.rotation.z=Math.PI/8; group.add(m1,m2); break;
    case 'piagam': m1 = new THREE.Mesh(new THREE.BoxGeometry(1.2,1.8,0.1), mat); m1.position.y=1; m1.rotation.x=-Math.PI/12; m2 = new THREE.Mesh(new THREE.BoxGeometry(1,1.4,0.12), new THREE.MeshStandardMaterial({color:0xffffff})); m2.position.set(0,1.1,0.02); m2.rotation.x=-Math.PI/12; group.add(m1,m2); break;
    case 'gunung': m1 = new THREE.Mesh(new THREE.ConeGeometry(2,2,16), mat); m1.position.y=1; group.add(m1); break;
    case 'perahu': m1 = new THREE.Mesh(new THREE.BoxGeometry(3,0.6,1), mat); m1.position.y=0.3; m2 = new THREE.Mesh(new THREE.ConeGeometry(1,1,3), mat); m2.position.set(1.5,0.5,0); m2.rotation.z=-Math.PI/2; group.add(m1,m2); break;
    default: m1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat); m1.position.y=0.5; group.add(m1);
  }
  group.children.forEach((c) => { c.castShadow = true; c.receiveShadow = true; });
  return group;
}
