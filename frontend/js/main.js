// SERVICE WORKER REGISTER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// REMINDER FUNCTION
async function enableReminder() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  // test reminder (5 sec)
  setTimeout(() => {
    new Notification("WarpTask ⚡", {
      body: "Diqqatingni jamlash vaqti keldi",
        icon: "/imgs/warptasks.png",
        badge: "/imgs/warptasks.png"      
    });
  }, 5000);
}














// DESKTOP

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Warptask web saytingni kiriting
  win.loadURL('https://warptask.netlify.app');

  // Developer Tools (xohlasa o'chirsa bo'ladi)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


