const electron = require('electron');
const path = require('path');
const fs = require('fs');

// Quando ELECTRON_RUN_AS_NODE está definido (ex.: terminal do Cursor), require('electron') retorna o caminho do binário, não a API.
if (typeof electron === 'string' || !electron.app) {
  console.error('Execute o app pelo Terminal do sistema (não pelo terminal do Cursor):');
  console.error('  cd karaoke-app && npm start');
  console.error('Ou dê duplo clique em "Karaokê Sisterhood.command".');
  if (process.env.ELECTRON_RUN_AS_NODE) {
    console.error('(ELECTRON_RUN_AS_NODE está definido neste ambiente.)');
  }
  process.exit(1);
}

const { app, BrowserWindow, ipcMain, screen, nativeImage } = electron;

const ROOT_DIR = path.resolve(__dirname, '..');

function getAppIcon() {
  try {
    const iconPath = path.join(ROOT_DIR, 'assets', 'logo.png');
    if (!fs.existsSync(iconPath)) return undefined;
    const img = nativeImage.createFromPath(iconPath);
    return img.isEmpty() ? undefined : img;
  } catch (_) {
    return undefined;
  }
}

// Pasta de vídeos: songs/ na raiz do projeto
const KARAOKE_DIR = path.join(ROOT_DIR, 'songs');

// Reduz mensagens de erro/warning no terminal (ffmpeg, sysctl, etc.)
if (app && app.commandLine) {
  app.commandLine.appendSwitch('enable-logging', 'false');
  app.commandLine.appendSwitch('disable-logging', 'true');
}

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
    title: 'Sistema de Karaokê — Reprodução',
    backgroundColor: '#000000',
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, '..', 'player', 'player-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  playerWindow.setMenuBarVisibility(false);
  playerWindow.loadFile(path.join(__dirname, '..', 'player', 'player.html'));
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
    title: 'Sistema de Karaokê',
    ...(icon && { icon }),
    webPreferences: {
      preload: path.join(__dirname, '..', 'renderer', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  try {
    const { generatePdf } = require('../scripts/generate-list-pdf.js');
    generatePdf();
  } catch (e) {
    console.error('PDF:', e.message);
  }
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
