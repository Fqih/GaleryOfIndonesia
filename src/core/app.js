import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { provincesData } from '../data/provinces.js';
import { isMobileDevice } from '../controls/deviceDetector.js';
import { initDesktopKeys } from '../controls/desktopControls.js';
import { initMobileControls } from '../controls/mobileControls.js';
import { Narrator } from '../audio/narrator.js';
import { buildLobby, buildProvinceRoom } from '../scenes/worldBuilder.js';

export class App {
  constructor() {
    this.isMobile = isMobileDevice();
    this.playerHeight = 4.5;
    this.currentRoomState = 'lobby';
    this.portalZones = [];
    this.lobbyPiagamZones = [];
    this.roomExhibitZones = [];
    this.currentRoomExhibits = [];
    this.returnZone = null;

    this.state = {
      moveForward: false, moveBackward: false, moveLeft: false, moveRight: false,
      canJump: false, velocity: new THREE.Vector3(), direction: new THREE.Vector3(),
      joystickX: 0, joystickY: 0
    };

    this.dom = {
      websiteUI: document.getElementById('website-ui'),
      museumContainer: document.getElementById('museum-container'),
      canvasContainer: document.getElementById('canvas-container'),
      blocker: document.getElementById('blocker'),
      ingameHeader: document.getElementById('ingame-header'),
      bgm: document.getElementById('bgm-museum'),
      locationText: document.getElementById('location-text'),
      provincePanel: document.getElementById('province-panel'),
      provTitle: document.getElementById('prov-title'),
      proxAlert: document.getElementById('proximity-alert'),
      alertDest: document.getElementById('alert-dest'),
      piagamAlert: document.getElementById('piagam-alert'),
      piagamTag: document.getElementById('piagam-tag'),
      piagamTitle: document.getElementById('piagam-title'),
      piagamDesc: document.getElementById('piagam-desc'),
      controlModeText: document.getElementById('control-mode-text'),
      controlInstructions: document.getElementById('control-instructions')
    };

    this.dom.bgm.volume = 0.15;
    this.narrator = new Narrator();
    this.clock = new THREE.Clock();
  }

  start() {
    this.setupLandingCards();
    this.setupThree();
    this.setupControls();
    this.setupUIEvents();
    this.setupWorld();
    this.animate();
  }

  setupLandingCards() {
    const grid = document.getElementById('province-grid');
    provincesData.forEach((prov) => {
      const hexColor = `#${prov.color.toString(16).padStart(6, '0')}`;
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group transform hover:-translate-y-1';
      card.innerHTML = `
        <div class="h-4 rounded-t-xl" style="background-color:${hexColor}"></div>
        <div class="p-6 flex-grow flex flex-col">
          <h3 class="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">${prov.name}</h3>
          <p class="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">${prov.desc}</p>
          <div class="mt-auto border-t border-gray-100 pt-4 flex flex-wrap gap-2">
            <span class="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-1 rounded-full font-medium">🏰 ${prov.exhibits[0].title}</span>
            <span class="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-1 rounded-full font-medium">🌊 ${prov.exhibits[4].title}</span>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  setupThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf1f5f9);
    this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.015);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.dom.canvasContainer.appendChild(this.renderer.domElement);

    this.lobbyGroup = new THREE.Group();
    this.roomGroup = new THREE.Group();
    this.scene.add(this.lobbyGroup, this.roomGroup);
    this.roomGroup.visible = false;
  }

  setupControls() {
    document.body.classList.toggle('mobile-mode', this.isMobile);
    this.dom.controlModeText.innerText = this.isMobile ? 'Mode Mobile: Analog + Swipe Kamera' : 'Mode Desktop: WASD + Mouse';
    this.dom.controlInstructions.innerHTML = this.isMobile
      ? `<p><b class="text-amber-700">Analog kiri</b> : Bergerak</p><p><b class="text-amber-700">Swipe kanan</b> : Melihat sekitar</p><p><b class="text-amber-700">Tombol kanan</b> : Masuk / Interaksi</p>`
      : `<p><b class="text-amber-700 w-24 inline-block">W,A,S,D</b> : Bergerak</p><p><b class="text-amber-700 w-24 inline-block">MOUSE</b> : Melihat sekeliling</p><p><b class="text-amber-700 w-24 inline-block">SPASI</b> : Melompat</p><p><b class="text-amber-700 w-24 inline-block">ESC</b> : Pause</p>`;

    if (this.isMobile) {
      this.cameraHolder = new THREE.Object3D();
      this.cameraHolder.position.set(0, this.playerHeight, 35);
      this.cameraHolder.add(this.camera);
      this.scene.add(this.cameraHolder);
      initMobileControls(this.state, this.cameraHolder);
    } else {
      this.controls = new PointerLockControls(this.camera, document.body);
      this.controls.getObject().position.set(0, this.playerHeight, 35);
      initDesktopKeys(this.state);
      this.controls.addEventListener('lock', () => { this.dom.blocker.style.display = 'none'; this.dom.ingameHeader.classList.remove('hidden'); });
      this.controls.addEventListener('unlock', () => {
        if (!this.dom.museumContainer.classList.contains('hidden')) {
          this.dom.blocker.style.display = 'flex';
          this.dom.ingameHeader.classList.add('hidden');
          window.speechSynthesis.pause();
        }
      });
    }
  }

  getPlayerObject() { return this.isMobile ? this.cameraHolder : this.controls.getObject(); }

  setupUIEvents() {
    document.getElementById('btn-enter-nav').addEventListener('click', () => this.enterMuseumMode());
    document.getElementById('btn-enter-hero').addEventListener('click', () => this.enterMuseumMode());
    document.getElementById('btn-close-museum').addEventListener('click', (e) => { e.stopPropagation(); this.exitMuseumMode(); });
    document.getElementById('btn-exit-museum').addEventListener('click', (e) => { e.stopPropagation(); this.exitMuseumMode(); });
    document.getElementById('btn-continue-museum').addEventListener('click', () => { if (!this.isMobile) this.controls.lock(); else this.unlockMobileOverlay(); });
    this.dom.blocker.addEventListener('click', () => { if (!this.isMobile) this.controls.lock(); else this.unlockMobileOverlay(); });
    document.getElementById('mobile-interact-btn').addEventListener('click', () => this.tryManualInteraction());

    window.addEventListener('resize', () => {
      if (!this.dom.museumContainer.classList.contains('hidden')) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }

  setupWorld() {
    const lobby = buildLobby(this.lobbyGroup, provincesData);
    this.portalZones = lobby.portalZones;
    this.lobbyPiagamZones = lobby.lobbyPiagamZones;
  }

  enterMuseumMode() {
    this.dom.websiteUI.classList.add('opacity-0');
    setTimeout(() => {
      this.dom.websiteUI.classList.add('hidden');
      this.dom.museumContainer.classList.remove('hidden');
      this.dom.museumContainer.classList.remove('opacity-0');
      document.body.classList.add('museum-active');
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.dom.bgm.play().catch(() => {});
      if (!this.isMobile) this.controls.lock(); else this.unlockMobileOverlay();
    }, 300);
  }

  unlockMobileOverlay() {
    this.dom.blocker.style.display = 'none';
    this.dom.ingameHeader.classList.remove('hidden');
  }

  exitMuseumMode() {
    if (!this.isMobile) this.controls.unlock();
    this.dom.museumContainer.classList.add('opacity-0');
    setTimeout(() => {
      this.dom.museumContainer.classList.add('hidden');
      this.dom.websiteUI.classList.remove('hidden', 'opacity-0');
      document.body.classList.remove('museum-active');
      this.dom.bgm.pause();
      this.narrator.stop();
    }, 300);
  }

  enterRoom(provData) {
    this.currentRoomState = 'room';
    const room = buildProvinceRoom(this.roomGroup, provData);
    this.roomExhibitZones = room.roomExhibitZones;
    this.currentRoomExhibits = room.currentRoomExhibits;
    this.returnZone = room.returnZone;
    this.dom.locationText.innerText = `Galeri: ${provData.name}`;
    this.dom.provTitle.innerText = provData.name;
    this.dom.provincePanel.classList.remove('hidden');
    this.dom.proxAlert.classList.add('hidden');
    this.dom.piagamAlert.classList.add('hidden');
    this.narrator.stop();
    this.getPlayerObject().position.set(0, this.playerHeight, 12);
    this.lobbyGroup.visible = false;
    this.roomGroup.visible = true;
  }

  returnToLobby() {
    this.currentRoomState = 'lobby';
    this.dom.locationText.innerText = 'Lokasi: Lobi Galeri Utama';
    this.dom.provincePanel.classList.add('hidden');
    this.dom.proxAlert.classList.add('hidden');
    this.dom.piagamAlert.classList.add('hidden');
    this.narrator.stop();
    this.getPlayerObject().position.set(0, this.playerHeight, 30);
    this.roomGroup.visible = false;
    this.lobbyGroup.visible = true;
  }

  showPiagam(data) {
    if (this.narrator.activeTitle !== data.title) {
      this.narrator.activeTitle = data.title;
      this.dom.piagamTag.innerText = data.tag;
      this.dom.piagamTitle.innerText = data.title;
      this.dom.piagamDesc.innerText = data.desc;
      this.dom.piagamAlert.classList.remove('hidden');
      this.narrator.speak(data.title, data.desc);
    }
  }

  tryManualInteraction() {
    const playerPos = this.getPlayerObject().position.clone(); playerPos.y = 0;
    if (this.currentRoomState === 'lobby') {
      const zone = this.portalZones.find((z) => playerPos.distanceTo(z.pos) < z.radius + 1);
      if (zone) this.enterRoom(zone.data);
    } else if (this.returnZone && playerPos.distanceTo(this.returnZone.pos) < this.returnZone.radius + 1) {
      this.returnToLobby();
    }
  }

  updateMovement(delta) {
    const obj = this.getPlayerObject();
    const { velocity, direction } = this.state;
    velocity.x -= velocity.x * 8 * delta;
    velocity.z -= velocity.z * 8 * delta;
    velocity.y -= 9.8 * 15 * delta;

    if (this.isMobile) {
      direction.z = this.state.joystickY;
      direction.x = this.state.joystickX;
      direction.normalize();
      const yaw = obj.rotation.y;
      const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
      const speed = 45 * delta;
      obj.position.addScaledVector(forward, direction.z * speed);
      obj.position.addScaledVector(right, direction.x * speed);
    } else if (this.controls.isLocked) {
      direction.z = Number(this.state.moveForward) - Number(this.state.moveBackward);
      direction.x = Number(this.state.moveRight) - Number(this.state.moveLeft);
      direction.normalize();
      const speed = 120;
      if (this.state.moveForward || this.state.moveBackward) velocity.z -= direction.z * speed * delta;
      if (this.state.moveLeft || this.state.moveRight) velocity.x -= direction.x * speed * delta;
      this.controls.moveRight(-velocity.x * delta);
      this.controls.moveForward(-velocity.z * delta);
      obj.position.y += velocity.y * delta;
    }

    if (obj.position.y < this.playerHeight) { velocity.y = 0; obj.position.y = this.playerHeight; this.state.canJump = true; }
  }

  updateInteraction() {
    const obj = this.getPlayerObject();
    const playerPos = obj.position.clone(); playerPos.y = 0;
    let isNearPortal = false;
    let isNearPiagam = false;

    if (this.currentRoomState === 'lobby') {
      obj.position.x = Math.max(-18, Math.min(18, obj.position.x));
      obj.position.z = Math.max(-38, Math.min(38, obj.position.z));
      for (const zone of this.lobbyPiagamZones) {
        if (playerPos.distanceTo(zone.pos) < zone.radius) { isNearPiagam = true; this.showPiagam(zone.data); break; }
      }
      for (const zone of this.portalZones) {
        const dist = playerPos.distanceTo(zone.pos);
        if (dist < zone.radius) { isNearPortal = true; this.dom.alertDest.innerText = zone.data.name; this.dom.proxAlert.classList.remove('hidden'); }
        if (!this.isMobile && dist < zone.radius - 2) this.enterRoom(zone.data);
      }
    } else {
      obj.position.x = Math.max(-18, Math.min(18, obj.position.x));
      obj.position.z = Math.max(-18, Math.min(18, obj.position.z));
      for (const zone of this.roomExhibitZones) {
        if (playerPos.distanceTo(zone.pos) < zone.radius) { isNearPiagam = true; this.showPiagam(zone.data); break; }
      }
      if (this.returnZone) {
        const dist = playerPos.distanceTo(this.returnZone.pos);
        if (dist < this.returnZone.radius) { isNearPortal = true; this.dom.alertDest.innerText = 'Lobi Utama'; this.dom.proxAlert.classList.remove('hidden'); }
        if (!this.isMobile && dist < this.returnZone.radius - 2) this.returnToLobby();
      }
    }

    if (!isNearPortal) this.dom.proxAlert.classList.add('hidden');
    if (!isNearPiagam) {
      this.dom.piagamAlert.classList.add('hidden');
      if (this.narrator.activeTitle !== '') this.narrator.stop();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.dom.museumContainer.classList.contains('hidden') || this.dom.museumContainer.classList.contains('opacity-0')) return;
    const delta = Math.min(this.clock.getDelta(), 0.1);
    if (this.currentRoomState === 'room') this.currentRoomExhibits.forEach((art, idx) => { art.rotation.y += (idx === 4 ? 0.2 : 0.5) * delta; });
    if (this.isMobile || this.controls.isLocked) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      this.updateMovement(delta);
      this.updateInteraction();
    }
    this.renderer.render(this.scene, this.camera);
  }
}
