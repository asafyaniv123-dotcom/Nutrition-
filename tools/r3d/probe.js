// First look: the figure in its rest pose, in the approved light, side 3/4 like the squat clip.
window.setup = async function () {
  const names = await loadFigure('/Xbot.glb');
  const THREE = window.THREE;
  const box = new THREE.Box3().setFromObject(fig);
  camera.position.set(2.6, 1.0, 3.6); camera.lookAt(0, 0.9, 0);
  return { bones: names.join(','), height: (box.max.y - box.min.y).toFixed(2), minY: box.min.y.toFixed(2) };
};
window.pose = function () {};
