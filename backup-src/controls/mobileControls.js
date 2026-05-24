import nipplejs from 'nipplejs';

export function initMobileControls(state, cameraHolder) {
  const zone = document.getElementById('joystick-zone');
  const joystick = nipplejs.create({
    zone,
    mode: 'static',
    position: { left: '70px', bottom: '70px' },
    color: '#b45309',
    size: 110
  });

  joystick.on('move', (_, data) => {
    if (!data?.vector) return;
    state.joystickX = data.vector.x;
    state.joystickY = data.vector.y;
  });

  joystick.on('end', () => {
    state.joystickX = 0;
    state.joystickY = 0;
  });

  let lastX = null;
  let lastY = null;

  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t.clientX < window.innerWidth / 2) return;
    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (lastX === null || t.clientX < window.innerWidth / 2) return;

    const dx = t.clientX - lastX;
    const dy = t.clientY - lastY;

    cameraHolder.rotation.y -= dx * 0.004;
    cameraHolder.children[0].rotation.x -= dy * 0.003;
    cameraHolder.children[0].rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraHolder.children[0].rotation.x));

    lastX = t.clientX;
    lastY = t.clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    lastX = null;
    lastY = null;
  }, { passive: true });
}
