import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function useRaycastInteraction({ camera, isLocked, isCutscenePlaying, portals = [], interactableCases = [], onEnterPortal, onInspectArtifact }) {
  const [notification, setNotification] = useState('');
  const raycasterRef = useRef(new THREE.Raycaster());
  
  const nearPortalRef = useRef(null);
  const lookAtArtifactRef = useRef(null);

  useEffect(() => {
    if (!camera) return;

    const raycaster = raycasterRef.current;
    const centerPoint = new THREE.Vector2(0, 0);

    const onMouseDown = (e) => {
      if (!isLocked || isCutscenePlaying || e.button !== 0) return;

      if (nearPortalRef.current) {
        onEnterPortal(nearPortalRef.current.userData.id);
      } else if (lookAtArtifactRef.current) {
        onInspectArtifact(lookAtArtifactRef.current);
      }
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [camera, isLocked, isCutscenePlaying, portals, interactableCases, onEnterPortal, onInspectArtifact]);

  const updateRaycast = () => {
    if (!camera || !isLocked || isCutscenePlaying) {
      if (notification) setNotification('');
      return;
    }

    const pos = camera.position;
    let nearestPortal = null;
    let minDistance = 4;

    for (const p of portals) {
      const dist = pos.distanceTo(p.position);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPortal = p;
      }
    }
    nearPortalRef.current = nearestPortal;

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    // Cek objek apa saja yang kena sinar dari array interactableCases (kaca etalase)
    const intersects = raycaster.intersectObjects(interactableCases, false);
    
    let targetArtifactId = null;
    if (intersects.length > 0 && intersects[0].distance < 6.0) {
      targetArtifactId = intersects[0].object.userData.id;
    }
    lookAtArtifactRef.current = targetArtifactId;

    const newNotif = nearestPortal
      ? 'Klik Kiri untuk Masuk Portal'
      : (targetArtifactId ? 'Klik Kiri untuk Inspeksi Artefak' : '');

    if (notification !== newNotif) {
      setNotification(newNotif);
    }
  };

  return { notification, updateRaycast };
}
