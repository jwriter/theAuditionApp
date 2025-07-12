const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  onFileList: (callback) => ipcRenderer.on('update-file-list', (_, data) => callback(data)),
  notifyFileClicked: (fileName) => ipcRenderer.send('file-clicked', fileName), 
  joinPathes: (folder, filename)=>path.join(folder, filename),
  parseFile: (p) => path.parse(p),
  formatFile: (p) => path.format(p),
  existsSync: (p) => fs.existsSync(p)
});

