import * as THREE from 'three';
import { createLandmarkGeometry, floorMat, wallMat, woodMat } from '../core/geometryFactory.js';

export function buildLobby(lobbyGroup, provincesData) {
  const portalZones = [];
  const lobbyPiagamZones = [];
  const hW = 40, hL = 80, hH = 20;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(hW, hL), floorMat); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; lobbyGroup.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(hW, hL), wallMat); ceiling.rotation.x = Math.PI / 2; ceiling.position.y = hH; lobbyGroup.add(ceiling);
  const wallF = new THREE.Mesh(new THREE.PlaneGeometry(hW, hH), wallMat); wallF.position.set(0, hH / 2, -hL / 2); lobbyGroup.add(wallF);
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(hW, hH), wallMat); wallB.position.set(0, hH / 2, hL / 2); wallB.rotation.y = Math.PI; lobbyGroup.add(wallB);
  const wallR = new THREE.Mesh(new THREE.PlaneGeometry(hL, hH), wallMat); wallR.position.set(hW / 2, hH / 2, 0); wallR.rotation.y = -Math.PI / 2; lobbyGroup.add(wallR);
  const wallL = new THREE.Mesh(new THREE.PlaneGeometry(hL, hH), wallMat); wallL.position.set(-hW / 2, hH / 2, 0); wallL.rotation.y = Math.PI / 2; lobbyGroup.add(wallL);

  lobbyGroup.add(new THREE.AmbientLight(0xffffff, 0.5));
  for (let z = -30; z <= 30; z += 15) {
    const cl = new THREE.PointLight(0xfff5e6, 30, 40);
    cl.position.set(0, hH - 2, z);
    lobbyGroup.add(cl);
  }

  provincesData.forEach((prov, idx) => {
    const isLeft = idx < Math.ceil(provincesData.length / 2);
    const i = isLeft ? idx : idx - Math.ceil(provincesData.length / 2);
    const posX = isLeft ? -(hW / 2) + 0.1 : (hW / 2) - 0.1;
    const posZ = -24 + (i * 12);
    const rotY = isLeft ? Math.PI / 2 : -Math.PI / 2;

    const exG = new THREE.Group(); exG.position.set(posX, 0, posZ); exG.rotation.y = rotY;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 0.5), woodMat); frame.position.set(0, 4.5, 0); exG.add(frame);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), new THREE.MeshBasicMaterial({ color: 0x111111 })); door.position.set(0, 4, 0.26); exG.add(door);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 2), new THREE.MeshStandardMaterial({ color: 0xdddddd })); ped.position.set(4.5, 1.25, 1); exG.add(ped);
    const mini = createLandmarkGeometry(prov.lobbyHouse, prov.color); mini.scale.set(0.6, 0.6, 0.6); mini.position.set(4.5, 2.5, 1); exG.add(mini);
    const plLight = new THREE.PointLight(0xffffff, 10, 5); plLight.position.set(4.5, 6, 2); exG.add(plLight);
    lobbyGroup.add(exG);

    const doorGlobalPos = new THREE.Vector3(); door.getWorldPosition(doorGlobalPos);
    portalZones.push({ pos: new THREE.Vector3(doorGlobalPos.x + (isLeft ? 3 : -3), 0, doorGlobalPos.z), radius: 3.5, data: prov });
    const pedGlobalPos = new THREE.Vector3(); ped.getWorldPosition(pedGlobalPos);
    lobbyPiagamZones.push({ pos: new THREE.Vector3(pedGlobalPos.x + (isLeft ? 3 : -3), 0, pedGlobalPos.z), radius: 4, data: { title: `Provinsi ${prov.name}`, desc: prov.desc, tag: 'Pengantar Galeri' } });
  });

  return { portalZones, lobbyPiagamZones };
}

export function buildProvinceRoom(roomGroup, provData) {
  while (roomGroup.children.length > 0) roomGroup.remove(roomGroup.children[0]);
  const roomExhibitZones = [];
  const currentRoomExhibits = [];
  const rW = 40, rL = 40, rH = 15;

  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(rW, rL), floorMat); roomFloor.rotation.x = -Math.PI / 2; roomGroup.add(roomFloor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(rW, rL), wallMat); ceiling.rotation.x = Math.PI / 2; ceiling.position.y = rH; roomGroup.add(ceiling);
  const wallF = new THREE.Mesh(new THREE.PlaneGeometry(rW, rH), wallMat); wallF.position.set(0, rH / 2, -rL / 2); roomGroup.add(wallF);
  const wallB = new THREE.Mesh(new THREE.PlaneGeometry(rW, rH), wallMat); wallB.position.set(0, rH / 2, rL / 2); wallB.rotation.y = Math.PI; roomGroup.add(wallB);
  const wallR = new THREE.Mesh(new THREE.PlaneGeometry(rL, rH), wallMat); wallR.position.set(rW / 2, rH / 2, 0); wallR.rotation.y = -Math.PI / 2; roomGroup.add(wallR);
  const wallL = new THREE.Mesh(new THREE.PlaneGeometry(rL, rH), wallMat); wallL.position.set(-rW / 2, rH / 2, 0); wallL.rotation.y = Math.PI / 2; roomGroup.add(wallL);

  roomGroup.add(new THREE.AmbientLight(0xffffff, 0.7));
  for (let x = -10; x <= 10; x += 20) for (let z = -10; z <= 10; z += 20) { const cl = new THREE.PointLight(0xfff5e6, 20, 30); cl.position.set(x, rH - 2, z); roomGroup.add(cl); }

  const backDoorGroup = new THREE.Group(); backDoorGroup.position.set(0, 0, 19.5); backDoorGroup.rotation.y = Math.PI;
  const bFrame = new THREE.Mesh(new THREE.BoxGeometry(6, 9, 0.5), woodMat); bFrame.position.y = 4.5; backDoorGroup.add(bFrame);
  const bPortal = new THREE.Mesh(new THREE.PlaneGeometry(5, 8), new THREE.MeshBasicMaterial({ color: 0x222222 })); bPortal.position.set(0, 4, 0.26); backDoorGroup.add(bPortal);
  roomGroup.add(backDoorGroup);

  const posLayout = [{x:-12,z:-10},{x:12,z:-10},{x:-12,z:5},{x:12,z:5},{x:0,z:-12}];
  provData.exhibits.forEach((ex, idx) => {
    const pos = posLayout[idx];
    const pedGroup = new THREE.Group(); pedGroup.position.set(pos.x, 0, pos.z);
    const isMain = idx === 4; const scale = isMain ? 1.5 : 1;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(2 * scale, 2 * scale, 1.5, 32), new THREE.MeshStandardMaterial({ color: 0x333333 })); ped.position.y = 0.75; pedGroup.add(ped);
    const art = createLandmarkGeometry(ex.type, ex.color); art.scale.set(1.5 * scale, 1.5 * scale, 1.5 * scale); art.position.y = 1.5; pedGroup.add(art);
    roomGroup.add(pedGroup);
    currentRoomExhibits.push(art);
    roomExhibitZones.push({ pos: new THREE.Vector3(pos.x, 0, pos.z), radius: 4.5 * scale, data: { title: ex.title, desc: ex.desc, tag: ex.tag } });
  });

  return { roomExhibitZones, currentRoomExhibits, returnZone: { pos: new THREE.Vector3(0, 0, 15), radius: 5 } };
}
