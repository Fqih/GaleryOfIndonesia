import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

// Hooks
import { useThreeEngine } from './hooks/useThreeEngine.jsx';
import { usePlayerFPS } from './hooks/usePlayerFPS.jsx';
import { useRaycastInteraction } from './hooks/useRaycastInteraction.jsx';

// Core Logic & Builders
import { buildLighting, buildParticles } from './core/EnvironmentBuilder.js';
import { buildMuseumGeometry } from './core/MuseumGeometryBuilder.js';
import { loadArtifactModel } from './core/ModelLoader.js';

// Modular UI
import StartScreen from './ui/StartScreen.jsx';
import PauseMenu from './ui/PauseMenu.jsx';
import AmbientHUD from './ui/AmbientHUD.jsx';
import SettingsModal from './ui/SettingsModal.jsx';
import Crosshair from './ui/Crosshair.jsx';
import CutsceneOverlay from './ui/CutsceneOverlay.jsx';
import ArtifactInspector from './ui/ArtifactInspector.jsx';

export default function Museum3DOverlay({
  onClose, onEnterPortal, isMusicOn, onToggleMusic, onDuckMusic,
  bgVolume, setBgVolume, narratorVolume, setNarratorVolume, spawnPortalId
}) {
  const mountRef = useRef(null);

  // HUD & State
  const [inspectingItem, setInspectingItem] = useState(null);
  const [hasStarted, setHasStarted] = useState(!!spawnPortalId);
  const [isCutscenePlaying, setIsCutscenePlaying] = useState(false);
  const hasStartedRef = useRef(!!spawnPortalId);
  const cutsceneTlRef = useRef(null);
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState('high');
  const [moveSpeed, setMoveSpeed] = useState('santai');
  const [mouseSensitivity, setMouseSensitivity] = useState(1.0);

  // 1. Engine Setup
  const { scene, camera, renderer } = useThreeEngine({ mountRef, graphicsQuality });

  // 2. Player Controls
  const { isLocked, controls, updatePhysics } = usePlayerFPS({
    camera,
    renderer,
    mouseSensitivity,
    moveSpeed,
    isSettingsOpen,
    isInspecting: !!inspectingItem,
    isCutscenePlaying,
    hasStarted,
    autoLock: false // handled by cutscene or start
  });

  const interactablesRef = useRef({ portals: [], artifacts: [], pillars: [], interactableCases: [], particlesMesh: null });
  const lookTargetRef = useRef(new THREE.Vector3(0, 5, 0));

  // 3. Scene Construction
  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    // Bersihkan scene dari sisa-sisa render sebelumnya (Fix Memory Leak)
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    buildLighting(scene);
    const { portals, artifacts, pillarPositions, interactableCases } = buildMuseumGeometry(scene, renderer);

    interactablesRef.current.portals = portals;
    interactablesRef.current.artifacts = artifacts;
    interactablesRef.current.pillars = pillarPositions;
    interactablesRef.current.interactableCases = interactableCases;

    // Load Particles
    const particlesMesh = buildParticles(scene);
    interactablesRef.current.particlesMesh = particlesMesh;

    // Load artifact models
    artifacts.forEach((wrapper, index) => {
      loadArtifactModel(index + 1, wrapper);
    });

    if (spawnPortalId && controls) {
      const portal = portals.find(p => p.userData.id === spawnPortalId);
      if (portal) {
        const pPos = portal.position;
        const angle = Math.atan2(pPos.x, pPos.z);
        // spawn in front of the portal facing center
        camera.position.set(Math.sin(angle) * 22, 2, Math.cos(angle) * 22);
        camera.lookAt(0, 2, 0);
        
        // Auto lock when spawning from a room
        setTimeout(() => {
          if (controls && !controls.isLocked) controls.lock();
        }, 500);
      }
    }

  }, [scene, camera, renderer, spawnPortalId, controls]);

  // 4. Raycaster Interaction
  const { notification, updateRaycast } = useRaycastInteraction({
    camera,
    isLocked,
    isCutscenePlaying,
    portals: interactablesRef.current.portals,
    interactableCases: interactablesRef.current.interactableCases,
    onEnterPortal,
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
      interactablesRef.current.artifacts.forEach((wrapper, i) => {
        wrapper.rotation.y += 0.5 * delta * (i % 2 === 0 ? 1 : -1);
      });

      // Animate Particles
      if (interactablesRef.current.particlesMesh) {
        // time is in ms, we convert to seconds for slow rotation
        interactablesRef.current.particlesMesh.rotation.y = (time / 1000) * 0.05;
      }

      // Jika cutscene sedang berjalan, paksa kamera menatap lookTarget
      if (cutsceneTlRef.current && cutsceneTlRef.current.isActive()) {
        camera.lookAt(lookTargetRef.current);
      }

      // Update Physics & Collisions
      updatePhysics(delta, (camPos, velocity) => {
        // Outer Wall Collision
        const distFromCenter = Math.sqrt(camPos.x * camPos.x + camPos.z * camPos.z);
        if (distFromCenter > 23.5) {
          const factor = 23.5 / distFromCenter;
          camPos.x *= factor;
          camPos.z *= factor;
          // Catatan: Modifikasi velocity dihilangkan karena velocity sekarang menggunakan
          // koordinat lokal relatif terhadap kamera (PointerLockControls standard),
          // sehingga kita tidak bisa melalukan dot product dengan global normal.
        }

        // Pillar Collision
        interactablesRef.current.pillars.forEach(pillarPos => {
          const dx = camPos.x - pillarPos.x;
          const dz = camPos.z - pillarPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2.0 && dist > 0) {
            const overlap = 2.0 - dist;
            const nx = dx / dist;
            const nz = dz / dist;
            camPos.x += nx * overlap;
            camPos.z += nz * overlap;
          }
        });

        // Pedestal Collision (Sliding)
        const pedPositions = [{ x: 5, z: 5 }, { x: -5, z: 5 }, { x: 5, z: -5 }, { x: -5, z: -5 }];
        pedPositions.forEach(pedPos => {
          const dx = camPos.x - pedPos.x;
          const dz = camPos.z - pedPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.4 && dist > 0) {
            const overlap = 1.4 - dist;
            const nx = dx / dist;
            const nz = dz / dist;
            camPos.x += nx * overlap;
            camPos.z += nz * overlap;
          }
        });
      });

      // Raycast update
      updateRaycast();

      renderer.render(scene, camera);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scene, camera, renderer, updatePhysics, updateRaycast]);

  // 6. Start Cutscene Sequence
  const handleStart = () => {
    if (hasStartedRef.current || !camera) return;

    setHasStarted(true);
    hasStartedRef.current = true;
    setIsCutscenePlaying(true);

    const lookTarget = lookTargetRef.current;

    // Starting Point (High angle wide shot)
    camera.position.set(0, 15, 25);
    lookTarget.set(0, 5, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        // Biarkan kosong. CutsceneOverlay akan di-unmount oleh audio onEnded (narasi selesai).
      }
    });
    cutsceneTlRef.current = tl;

    // 0s - 8s: Panning awal dan Typography (Fade in/out dari UI)
    tl.to(camera.position, { x: 0, y: 3, z: 12, duration: 8, ease: "power2.inOut" }, 0);
    tl.to(lookTarget, { x: 0, y: 4, z: 0, duration: 8, ease: "power2.inOut" }, 0);

    // 9s - 18s: Menyorot ke arah banner / area tengah
    tl.to(camera.position, { x: -18, y: 6, z: 5, duration: 9, ease: "power2.inOut" }, 9);
    tl.to(lookTarget, { x: 0, y: 6, z: 0, duration: 9, ease: "power2.inOut" }, 9);

    // 19s - 26s: Menyorot 4 artefak bergantian
    const pedestalPositions = [{ x: 5, z: 5 }, { x: -5, z: 5 }, { x: 5, z: -5 }, { x: -5, z: -5 }];
    for (let i = 0; i < 4; i++) {
      const pos = pedestalPositions[i];
      const startTime = 19 + (i * (7 / 4)); // durasi 7 detik dibagi 4
      tl.to(camera.position, { x: pos.x * 0.7, y: 3.5, z: pos.z * 0.7, duration: 7 / 4, ease: "power1.inOut" }, startTime);
      tl.to(lookTarget, { x: pos.x, y: 2.5, z: pos.z, duration: 7 / 4, ease: "power1.inOut" }, startTime);
    }

    // 27s - selesai: Menyorot Pintu / Portals (Melihat sekeliling)
    tl.to(camera.position, { x: 0, y: 2, z: 0, duration: 4, ease: "power2.inOut" }, 27);
    tl.to(lookTarget, { x: 15, y: 2, z: -15, duration: 2, ease: "power1.inOut" }, 27);
    tl.to(lookTarget, { x: 15, y: 2, z: 15, duration: 2, ease: "power1.inOut" }, 29);
    tl.to(lookTarget, { x: -15, y: 2, z: 15, duration: 2, ease: "power1.inOut" }, 31);
    tl.to(lookTarget, { x: -15, y: 2, z: -15, duration: 2, ease: "power1.inOut" }, 33);

    // Kembali ke posisi natural (pintu masuk)
    tl.to(camera.position, { x: 0, y: 2, z: 12, duration: 3, ease: "power2.inOut" }, 35);
    tl.to(lookTarget, { x: 0, y: 2, z: -10, duration: 3, ease: "power2.out" }, 35);
  };

  const handleSkipCutscene = () => {
    if (cutsceneTlRef.current) {
      cutsceneTlRef.current.kill();
      cutsceneTlRef.current = null; // SANGAT KRUSIAL: Memastikan `isActive()` tidak lagi dievaluasi di render loop
    }
    if (camera) {
      // Kembalikan pemain ke pintu masuk menghadap ke dalam ruangan
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 2, 0); // Menghadap ke tengah ruangan
    }
    setIsCutscenePlaying(false);

    // Auto-lock agar mouse langsung bisa digunakan untuk eksplorasi FPS
    if (controls) {
      controls.lock();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div ref={mountRef} className="w-full h-full" />

      {/* Crosshair & Progress */}
      <Crosshair isLocked={isLocked} progress={0} />

      {/* HUD Info Lokasi */}
      {hasStarted && !isCutscenePlaying && (
        <div className={`absolute top-8 left-8 z-10 pointer-events-none transition-opacity duration-500 ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
          <div className="bg-black/40 backdrop-blur-xl ring-1 ring-white/10 px-6 py-4 rounded-2xl shadow-2xl">
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide drop-shadow-md">
              Lobby Utama
            </h1>
            <p className="text-white/70 mt-1.5 text-sm font-medium tracking-wider uppercase">
              Pusat Eksplorasi Gallery Of Indonesia
            </p>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!hasStarted && <StartScreen onStart={handleStart} />}

      {/* Cutscene Overlay (Bilah hitam sinematik & tombol Skip) */}
      {isCutscenePlaying && (
        <CutsceneOverlay
          onSkip={handleSkipCutscene}
          onDuckMusic={onDuckMusic}
          narratorVolume={narratorVolume}
        />
      )}

      {/* Target Notifikasi saat hover */}
      {notification && !isSettingsOpen && !inspectingItem && (
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <p className="text-white text-lg font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20">
            {notification}
          </p>
        </div>
      )}

      {/* Ambient HUD */}
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
        onClose={onClose}
      />

      {/* Item Inspector (Muncul jika klik artefak) */}
      {inspectingItem && (
        <ArtifactInspector
          itemId={inspectingItem}
          isVoiceOn={isVoiceOn}
          onClose={() => {
            setInspectingItem(null);
            if (controls) controls.lock();
            if (onDuckMusic) onDuckMusic(false);
          }}
        />
      )}

      {/* Pause Menu (Muncul saat tidak terkunci, sesudah start, dan tidak sedang buka settings/inspeksi) */}
      {!isLocked && hasStarted && !isCutscenePlaying && !isSettingsOpen && !inspectingItem && (
        <PauseMenu
          onResume={() => controls && controls.lock()}
          onExit={onClose}
        />
      )}

      {/* Settings Modal */}
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