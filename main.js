const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler for saving PDF
ipcMain.handle('save-pdf', async (event, options) => {
  if (!mainWindow) return { success: false, error: 'No main window active' };

  // Show Save Dialog
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Resume to PDF',
    defaultPath: path.join(app.getPath('documents'), 'resume.pdf'),
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) {
    return { success: false, cancelled: true };
  }

  try {
    // Print to PDF with normal letter / A4 print options
    const pdfData = await mainWindow.webContents.printToPDF({
      marginsType: 0, // No margins (handled in custom print CSS)
      pageSize: 'A4',
      printBackground: true,
      landscape: false,
    });

    // Write PDF data to target file
    fs.writeFileSync(filePath, pdfData);
    return { success: true, filePath };
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    return { success: false, error: err.message };
  }
});
