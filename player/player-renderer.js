const video = document.getElementById('video');

window.player.onVideoPath((filePath) => {
  if (!filePath) return;
  const src = 'file://' + encodeURI(filePath);
  video.src = src;
  video.play().catch((e) => console.error('Play error:', e));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    video.pause();
    window.player.close();
  }
});
