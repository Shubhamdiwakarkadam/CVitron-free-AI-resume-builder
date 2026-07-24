const { contextBridge, ipcRenderer } = require('electron');

// Expose secure API endpoints to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  savePDF: () => ipcRenderer.invoke('save-pdf'),
});
