const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFileList: (callback) => ipcRenderer.on('update-file-list', (_, data) => callback(data)),
  notifyFileClicked: (fileName) => ipcRenderer.send('file-clicked', fileName)
});
