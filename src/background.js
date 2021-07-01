'use strict'

import { app, screen, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const { Notification } = require('electron')
const { ipcMain } = require('electron')

// adding for screenshot
const electron = require("electron");
//const BrowserWindow = electron.remote.BrowserWindow;
const path = require("path");
const fs = require("fs");
const dialog = electron.dialog
// let win = BrowserWindow.getAllWindows()[0];
let windowFocused = BrowserWindow.getFocusedWindow();
// end screenshot

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // getPrimaryDisplay has to execute after app ready
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  const win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      devTools: false,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  } 
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('save-screen-shot', (evt, arg) => {
  // app.quit()
  BrowserWindow.getFocusedWindow().webContents
          .capturePage({
              x: 0,
              y: 0,
              width: 800,
              height: 600,
          })
          .then((img) => {
              dialog
                  .showSaveDialog({
                      title: "Select the File Path to save",                
                      // Default path to assets folder
                      defaultPath: path.join(__dirname, "../assets/electron-screenshot.png"),
                      buttonLabel: "Save",                  
                      filters: [
                          {
                              name: "Image Files",
                              extensions: ["png", "jpeg", "jpg"],
                          },
                      ],
                      properties: [],
                  })
                  .then((file) => {
                      console.log(file.canceled);
                      if (!file.canceled) {
                          console.log(file.filePath.toString());                    
                          fs.writeFile(file.filePath.toString(), 
                              img.toPNG(), "base64", function (err) {
                              if (err) throw err;
                              console.log("Saved!");
                          });
                      }
                  })
                  .catch((err) => {
                      console.log(err);
                  });
          })
          .catch((err) => {
              console.log(err);
          });
})

function showEmailErrorNotification () {
  new Notification({ title: 'Email Error:', body: 'Check email address and make sure screenshot has been saved' }).show()
}

function showEmailSentNotification () {
  new Notification({ title: 'Email Sent:', body: 'Screenshot and Email Have Been Sent.' }).show()
}

ipcMain.on('screenshot-error', (evt, arg) => {
  app.whenReady().then(createWindow).then(showEmailErrorNotification)
})

ipcMain.on('email-sent', (evt, arg) => {
  app.whenReady().then(createWindow).then(showEmailSentNotification)
})
