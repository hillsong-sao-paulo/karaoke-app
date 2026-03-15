const { app, BrowserWindow, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { generatePdf } = require('./generate-list-pdf.js');

function getAppIcon() {
  try {
    const iconPath = path.join(__dirname, 'assets', 'logo.png');
    if (!fs.existsSync(iconPath)) return undefined;
    const img = nativeImage.createFromPath(iconPath);
    return img.isEmpty() ? undefined : img;
  } catch (_) {
    return undefined;
  }
}

// Pasta de vídeos: sempre songs/ ao lado de main.js (caminho absoluto)
const KARAOKE_DIR = path.resolve(__dirname, 'songs');

// Reduz mensagens de erro/warning no terminal (ffmpeg, sysctl, etc.)
app.commandLine.appendSwitch('enable-logging', 'false');
app.commandLine.appendSwitch('disable-logging', 'true');

// Lê os vídeos disponíveis na pasta; nome esperado: "01 - Artista - Música.mp4" ou "25 - Nome.mp4"
function loadSongs() {
  try {
    if (!fs.existsSync(KARAOKE_DIR)) {
      console.error('Pasta não encontrada:', KARAOKE_DIR);
      return [];
    }
    const files = fs.readdirSync(KARAOKE_DIR);
    const songs = [];
    const videoExt = /\.(mp4|mkv|webm|mov)$/i;
    const nameRe = /^(\d{1,3})\s*-\s*(.+)\.(mp4|mkv|webm|mov)$/i;
    for (const file of files) {
      if (!videoExt.test(file)) continue;
      const m = file.match(nameRe);
      if (m) {
        const num = m[1].padStart(2, '0');
        const titulo = m[2].trim();
        const videoPath = path.join(KARAOKE_DIR, file);
        songs.push({ num, titulo, videoPath });
      }
    }
    songs.sort((a, b) => String(a.num).padStart(3, '0').localeCompare(String(b.num).padStart(3, '0')));
    return songs;
  } catch (e) {
    console.error('Erro ao ler pasta Karaoke:', e.message);
    return [];
  }
}

let mainWindow;
let playerWindow = null;

// Retorna o display secundário (HDMI) ou o primário se não houver outro
function getExternalDisplay() {
  const primary = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();
  const external = displays.find((d) => d.id !== primary.id) || primary;
  return external;
}

function createPlayerWindow(videoPath) {
  const display = getExternalDisplay();
  const { x, y, width, height } = display.bounds;

  if (playerWindow && !playerWindow.isDestroyed()) {
    playerWindow.focus();
    playerWindow.webContents.send('play-video', videoPath);
    return;
  }

  const icon = getAppIcon();
  playerWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    fullscreen: true,
    fullscreenable: true,
    title: 'Karaokê — Reprodução',
    backgroundColor: '#000000',
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, 'player-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  playerWindow.setMenuBarVisibility(false);
  playerWindow.loadFile('player.html');
  playerWindow.on('closed', () => {
    playerWindow = null;
  });
  playerWindow.webContents.on('did-finish-load', () => {
    playerWindow.webContents.send('play-video', videoPath);
  });
}

function createWindow() {
  const primary = screen.getPrimaryDisplay();
  const { width, height } = primary.bounds;

  const icon = getAppIcon();
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width),
    height: Math.min(800, height),
    fullscreen: true,
    fullscreenable: true,
    title: 'Karaokê - Hillsong São Paulo',
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  try { generatePdf(); } catch (e) { console.error('PDF:', e.message); }
  app.on('window-all-closed', () => app.quit());
});

ipcMain.handle('get-songs', () => loadSongs());

ipcMain.handle('open-song', (_, videoPath) => {
  if (!videoPath || typeof videoPath !== 'string') return { ok: false, error: 'Caminho inválido' };
  if (!fs.existsSync(videoPath)) {
    return { ok: false, error: 'Arquivo não encontrado' };
  }
  try {
    createPlayerWindow(videoPath);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('close-player', () => {
  if (playerWindow && !playerWindow.isDestroyed()) {
    playerWindow.close();
    playerWindow = null;
  }
});

ipcMain.handle('get-config', () => ({ karaokeDir: KARAOKE_DIR }));
