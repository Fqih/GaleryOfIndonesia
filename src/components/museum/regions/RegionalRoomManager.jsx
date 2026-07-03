import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { provincesData } from '../../../data/provincesData.jsx';

// Hooks
import { useThreeEngine } from '../hooks/useThreeEngine.jsx';
import { usePlayerFPS } from '../hooks/usePlayerFPS.jsx';
import { useRaycastInteraction } from '../hooks/useRaycastInteraction.jsx';

// Builders & Loaders
import { buildRegionalRoomGeometry, ROOM_W, ROOM_D } from '../core/RoomGeometryBuilder.js';
import { loadArtifactModel } from '../core/ModelLoader.js';
import { buildCaveLighting } from '../core/EnvironmentBuilder.js';
import { getRegionData } from '../../../data/regionsData.js';

// UI
import AmbientHUD from '../ui/AmbientHUD.jsx';
import PauseMenu from '../ui/PauseMenu.jsx';
import SettingsModal from '../ui/SettingsModal.jsx';
import Crosshair from '../ui/Crosshair.jsx';
import ArtifactInspector from '../ui/ArtifactInspector.jsx';

export default function RegionalRoomManager({ provId, onExit, onExitToHome, isMusicOn, onToggleMusic, onDuckMusic, bgVolume, setBgVolume, narratorVolume, setNarratorVolume }) {
  const mountRef = useRef(null);

  // States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState('high');
  const [moveSpeed, setMoveSpeed] = useState('santai');
  const [mouseSensitivity, setMouseSensitivity] = useState(1.0);
  const [inspectingItem, setInspectingItem] = useState(null);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Data
  const province = provincesData.find(p => p.id === provId);
  const roomName = province ? province.name : 'Ruangan Misterius';

  // 1. Engine
  const { scene, camera, renderer } = useThreeEngine({ mountRef, graphicsQuality });

  // 2. FPS Controls
  const { isLocked, controls, updatePhysics } = usePlayerFPS({
    camera,
    renderer,
    mouseSensitivity,
    moveSpeed,
    isSettingsOpen,
    isInspecting: !!inspectingItem,
    autoLock: true
  });

  const interactablesRef = useRef({ portals: [], artifacts: [], interactableCases: [] });

  // 3. Scene Construction
  useEffect(() => {
    if (!scene || !camera || !renderer) return;
    
    // Recursive Memory Cleanup (Garbage Collection)
    const disposeNode = (node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach(m => {
            if (m.map) m.map.dispose();
            if (m.bumpMap) m.bumpMap.dispose();
            m.dispose();
          });
        } else {
          if (node.material.map) node.material.map.dispose();
          if (node.material.bumpMap) node.material.bumpMap.dispose();
          node.material.dispose();
        }
      }
    };

    // Clear previous if any and Free VRAM
    while(scene.children.length > 0) { 
        const child = scene.children[0];
        scene.remove(child);
        child.traverse(disposeNode);
    }

    const regionData = getRegionData(provId);
    const { portals, artifacts, interactableCases } = buildRegionalRoomGeometry(scene, regionData);
    buildCaveLighting(scene);
    
    interactablesRef.current.portals = portals;
    interactablesRef.current.artifacts = artifacts.map(a => a.hitbox || a.wrapper); // fallback
    interactablesRef.current.interactableCases = interactableCases;

    // Load artifact models onto the pedestals
    artifacts.forEach((art) => {
      if (art.type === 'model') {
        const artifactModel = art.modelPath || ((art.index % 3) + 1);
        loadArtifactModel(artifactModel, art.wrapper, { targetSize: 3.5, alignBottom: true, yOffset: 0.1 });
      }
    });

    // Posisikan pemain (kamera) tepat di depan pintu (pintu ada di Z = 15)
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 2, 0); // Menghadap ke tengah ruangan

  }, [scene, camera, renderer, provId]);

  // 4. Raycast Interaction
  const { notification, updateRaycast } = useRaycastInteraction({
    camera,
    isLocked,
    isCutscenePlaying: false,
    portals: interactablesRef.current.portals,
    interactableCases: interactablesRef.current.interactableCases,
    onEnterPortal: (targetId) => {
      if (targetId === 'main') {
        onExit(); // Back to lobby
      }
    },
    onInspectArtifact: (id) => {
      setInspectingItem(id);
      if (controls && controls.isLocked) controls.unlock();
    }
  });

  // 5. Game Loop
  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    let animationFrameId;
    let prevTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = performance.now();
      const delta = (time - prevTime) / 1000;
      prevTime = time;

      // Rotate Artifacts slowly
      interactablesRef.current.artifacts.forEach((art, i) => {
        if (art.wrapper) {
          art.wrapper.rotation.y += 0.5 * delta * (i % 2 === 0 ? 1 : -1);
        }
      });

      // Update Physics & Box Collisions
      updatePhysics(delta, (camPos, velocity) => {
        const PLAYER_R = 0.5; // Radius player

        // --- 1. Batas Dinding Ruangan ---
        const boundX = (ROOM_W / 2) - 1.0;
        const boundZ = (ROOM_D / 2) - 1.0;
        if (camPos.x < -boundX) camPos.x = -boundX;
        if (camPos.x >  boundX) camPos.x =  boundX;
        if (camPos.z < -boundZ) camPos.z = -boundZ;
        if (camPos.z >  boundZ) camPos.z =  boundZ;

        // --- 2. Collision AABB Helper ---
        // Mendorong player keluar dari kotak jika menembus
        const resolveBox = (minX, maxX, minZ, maxZ) => {
          if (
            camPos.x > minX - PLAYER_R && camPos.x < maxX + PLAYER_R &&
            camPos.z > minZ - PLAYER_R && camPos.z < maxZ + PLAYER_R
          ) {
            // Hitung overlap di setiap sisi, dorong ke arah yang paling dekat
            const ox = camPos.x < (minX + maxX) / 2
              ? minX - PLAYER_R - camPos.x   // Dorong ke kiri
              : maxX + PLAYER_R - camPos.x;  // Dorong ke kanan
            const oz = camPos.z < (minZ + maxZ) / 2
              ? minZ - PLAYER_R - camPos.z   // Dorong ke depan
              : maxZ + PLAYER_R - camPos.z;  // Dorong ke belakang

            // Pilih sumbu overlap terkecil (resolusi minimum)
            if (Math.abs(ox) < Math.abs(oz)) {
              camPos.x += ox;
              velocity.x = 0;
            } else {
              camPos.z += oz;
              velocity.z = 0;
            }
          }
        };

        // --- 3. Board Kiri (x=-8, z=0): BoxGeometry 4 × 3 × 0.1 + stand 0.2×4×0.2 ---
        // Gunakan batas gabungan: x [-10, -6], z [-0.2, 0.2] (inklusif stand+board)
        resolveBox(-10.0, -6.0, -0.3, 0.3);

        // --- 4. Board Kanan (x=8, z=0): mirror dari kiri ---
        resolveBox(6.0, 10.0, -0.3, 0.3);

        // --- 5. Meja Maket + Kaca (x=0, z=-8): base 4×4 + kaca 3.8×3.8 ---
        // Padding sedikit lebih besar dari meja (4 unit lebar → x [-2, 2], z [-10, -6])
        resolveBox(-2.2, 2.2, -10.2, -5.8);
      });


      updateRaycast();
      renderer.render(scene, camera);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scene, camera, renderer, updatePhysics, updateRaycast]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={mountRef} className="w-full h-full" />

      {/* Crosshair */}
      <Crosshair isLocked={isLocked} progress={0} />

      {/* HUD Info Lokasi */}
      <div className={`absolute top-8 left-8 z-10 pointer-events-none transition-opacity duration-500 ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
        <div className="bg-black/40 backdrop-blur-xl ring-1 ring-white/10 px-6 py-4 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide drop-shadow-md">
            {roomName}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm font-medium tracking-wider uppercase">
            Ruang Ekshibisi Spesifik Daerah
          </p>
        </div>
      </div>

      {/* Target Notifikasi saat hover */}
      {notification && !isSettingsOpen && !inspectingItem && (
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <p className="text-white text-lg font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20">
            {notification}
          </p>
        </div>
      )}

      <AmbientHUD 
        isLocked={isLocked}
        isMusicOn={isMusicOn} 
        onToggleMusic={onToggleMusic} 
        onOpenSettings={() => {
          if (controls && controls.isLocked) controls.unlock();
          setIsSettingsOpen(true);
        }}
        isVoiceOn={isVoiceOn}
        onToggleVoice={() => setIsVoiceOn(!isVoiceOn)}
        onClose={onExit}
      />

      {inspectingItem && (
        <ArtifactInspector 
          itemId={inspectingItem}
          isVoiceOn={isVoiceOn}
          onDuckMusic={onDuckMusic}
          narratorVolume={narratorVolume}
          onClose={() => {
            setInspectingItem(null);
            if (controls) controls.lock();
            if (onDuckMusic) onDuckMusic(false);
          }}
        />
      )}

      {!isLocked && !isSettingsOpen && !inspectingItem && (
        <PauseMenu 
          onResume={() => {
            if (controls && !controls.isLocked) controls.lock();
          }}
          onExit={onExit}
        />
      )}



      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          graphicsQuality={graphicsQuality}
          setGraphicsQuality={setGraphicsQuality}
          moveSpeed={moveSpeed}
          setMoveSpeed={setMoveSpeed}
          mouseSensitivity={mouseSensitivity}
          setMouseSensitivity={setMouseSensitivity}
          bgVolume={bgVolume}
          setBgVolume={setBgVolume}
          narratorVolume={narratorVolume}
          setNarratorVolume={setNarratorVolume}
        />
      )}
    </div>
  );
}
