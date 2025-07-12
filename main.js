try {
  require('electron-reloader')(module);
} catch (_) {}

const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs');

const store = new Store();
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, 'assets', 'AuditionChatGPT.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadFile('index.html');

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            });
            if (!result.canceled && result.filePaths.length > 0) {
              const folder = result.filePaths[0];
              store.set('lastFolder', folder);
              scanFolder(folder);
            }
          }
        },
        { role: 'quit' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const lastFolder = store.get('lastFolder');
  if (lastFolder) {
    scanFolder(lastFolder);
  }
}

function scanFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));
    mainWindow.webContents.send('update-file-list', { folder: folderPath, files: mp4Files });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
