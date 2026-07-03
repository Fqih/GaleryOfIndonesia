import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function usePlayerFPS({ 
  camera, 
  renderer, 
  mouseSensitivity = 1.0, 
  moveSpeed = 'santai', 
  isSettingsOpen = false,
  isInspecting = false,
  isCutscenePlaying = false,
  hasStarted = true, 
  autoLock = false
}) {
  const controlsRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);

  // Movement Intent
  const moveStateRef = useRef({ forward: false, backward: false, left: false, right: false });
  const moveSpeedRef = useRef(100.0);
  const canJumpRef = useRef(false);

  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());

  const statesRef = useRef({ isSettingsOpen, isInspecting, isCutscenePlaying, hasStarted });
  useEffect(() => {
    statesRef.current = { isSettingsOpen, isInspecting, isCutscenePlaying, hasStarted };
  }, [isSettingsOpen, isInspecting, isCutscenePlaying, hasStarted]);

  // Initialization
  useEffect(() => {
    if (!camera || !renderer) return;

    //fix bug buat mouse gaming sens tinggi
    const controls = new PointerLockControls(camera, document.body);
    controlsRef.current = controls;

    const originalRequestPointerLock = document.body.requestPointerLock;
    document.body.requestPointerLock = function(options) {
      try {
        return originalRequestPointerLock.call(this, { unadjustedMovement: true });
      } catch (error) {
        return originalRequestPointerLock.call(this, options);
      }
    };

    const onLock = () => setIsLocked(true);
    const onUnlock = () => setIsLocked(false);

    controls.addEventListener('lock', onLock);
    controls.addEventListener('unlock', onUnlock);

    if (autoLock) {
      setTimeout(() => {
        try {
          if (!controls.isLocked) controls.lock();
        } catch (e) {
          console.warn("Auto-lock failed. Waiting for click.");
        }
      }, 100);
    }

    const handleClick = () => {
      const { isSettingsOpen: isSet, isInspecting: isIns, isCutscenePlaying: isCut, hasStarted: isStart } = statesRef.current;
      if (!controls.isLocked && !isSet && !isIns && !isCut && isStart) {
        controls.lock();
      }
    };
    document.body.addEventListener('click', handleClick);

    const onKeyDown = (event) => {
      const c = event.code;
      switch (c) {
        case 'ArrowUp':
        case 'KeyW': moveStateRef.current.forward = true; break;
        case 'ArrowLeft':
        case 'KeyA': moveStateRef.current.left = true; break;
        case 'ArrowDown':
        case 'KeyS': moveStateRef.current.backward = true; break;
        case 'ArrowRight':
        case 'KeyD': moveStateRef.current.right = true; break;
        case 'Space':
          if (canJumpRef.current) {
            velocityRef.current.y += 15;
            canJumpRef.current = false;
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          const { isSettingsOpen: isSet2, isInspecting: isIns2, isCutscenePlaying: isCut2, hasStarted: isStart2 } = statesRef.current;
          if (!isSet2 && !isIns2 && !isCut2 && isStart2) {
            if (controls.isLocked) controls.unlock();
            else controls.lock();
          }
          break;
      }
    };
    const onKeyUp = (event) => {
      const c = event.code;
      switch (c) {
        case 'ArrowUp':
        case 'KeyW': moveStateRef.current.forward = false; break;
        case 'ArrowLeft':
        case 'KeyA': moveStateRef.current.left = false; break;
        case 'ArrowDown':
        case 'KeyS': moveStateRef.current.backward = false; break;
        case 'ArrowRight':
        case 'KeyD': moveStateRef.current.right = false; break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.body.requestPointerLock = originalRequestPointerLock; // Kembalikan ke fungsi asli
      controls.removeEventListener('lock', onLock);
      controls.removeEventListener('unlock', onUnlock);
      document.body.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      controls.dispose();
    };
  }, [camera, renderer, autoLock]);

  useEffect(() => {
    moveSpeedRef.current = moveSpeed === 'santai' ? 100.0 : 200.0;
  }, [moveSpeed]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.pointerSpeed = mouseSensitivity;
    }
  }, [mouseSensitivity]);

  const updatePhysics = (rawDelta, collisionHandler = null) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) return;

    const delta = Math.min(rawDelta, 0.1);

    const velocity = velocityRef.current;
    const direction = directionRef.current;
    const moveState = moveStateRef.current;

    const damping = Math.exp(-10.0 * delta); 
    velocity.x *= damping;
    velocity.z *= damping;
    velocity.y -= 50.0 * delta;

    direction.set(0, 0, 0);
    if (moveState.forward) direction.z += 1;
    if (moveState.backward) direction.z -= 1;
    if (moveState.left) direction.x -= 1;
    if (moveState.right) direction.x += 1;
    if (direction.lengthSq() > 0) direction.normalize();

    if (moveState.forward || moveState.backward || moveState.left || moveState.right) {
      const accel = moveSpeedRef.current;
      velocity.x += direction.x * accel * delta;
      velocity.z += direction.z * accel * delta;
    }

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    camera.position.addScaledVector(right, velocity.x * delta);
    camera.position.addScaledVector(forward, velocity.z * delta);
    camera.position.y += velocity.y * delta;

    if (camera.position.y < 2) {
      velocity.y = 0;
      camera.position.y = 2;
      canJumpRef.current = true;
    }
    if (camera.position.y > 18) {
      velocity.y = 0;
      camera.position.y = 18;
    }

    if (collisionHandler) {
      collisionHandler(camera.position, velocity);
    }
  };

  return { isLocked, controls: controlsRef.current, updatePhysics };
}
