const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('player', {
  onVideoPath: (fn) => {
    ipcRenderer.on('play-video', (_, path) => fn(path));
  },
  close: () => ipcRenderer.invoke('close-player'),
});
