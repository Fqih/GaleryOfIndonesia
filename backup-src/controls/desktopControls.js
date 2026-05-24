export function initDesktopKeys(state) {
  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': state.moveForward = true; break;
      case 'ArrowLeft': case 'KeyA': state.moveLeft = true; break;
      case 'ArrowDown': case 'KeyS': state.moveBackward = true; break;
      case 'ArrowRight': case 'KeyD': state.moveRight = true; break;
      case 'Space': if (state.canJump) state.velocity.y += 30; state.canJump = false; break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': state.moveForward = false; break;
      case 'ArrowLeft': case 'KeyA': state.moveLeft = false; break;
      case 'ArrowDown': case 'KeyS': state.moveBackward = false; break;
      case 'ArrowRight': case 'KeyD': state.moveRight = false; break;
    }
  });
}
