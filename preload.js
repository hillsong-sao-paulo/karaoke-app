const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('karaoke', {
  getSongs: () => ipcRenderer.invoke('get-songs'),
  openSong: (videoPath) => ipcRenderer.invoke('open-song', videoPath),
  getConfig: () => ipcRenderer.invoke('get-config'),
});
