"use strict";

import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";
const { dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const mm = require("music-metadata");
let parser = new xml2js.Parser();
var builder = new xml2js.Builder({
  xmldec: { version: "1.0", encoding: "UTF-8", standalone: false },
});
// import Blob from "cross-blob";
// import { Blob, Buffer } from "buffer";
// var Buffer = require('buffer/').Buffer
// import { Buffer } from "buffer";
// import { Blob } from "node:buffer";
let win = null;
// const ipcMain = electron.ipcMain;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 1440,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setPosition(80, 0);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools({ mode: "bottom" });
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

ipcMain.on("toMain", function(event) {
  let file = dialog.showOpenDialogSync({
    title: "Find Library File",
    defaultPath: path.join(app.getPath("home"), "Music", "dj", "Traktor 3.4"),
    buttonLabel: "Open Library",
    properties: ["openFile"],
  });
  if (file == undefined) return console.log("no file selected, just continue");
  win.webContents.send("fromMain", file);
});

ipcMain.on("parseXML", function(event, arg) {
  let file = arg[0];
  fs.readFile(file, function(err, data) {
    parser.parseString(data, function(err, result) {
      win.webContents.send("sendJSobject", result);
    });
  });
});

ipcMain.on("buildXML", function(event, arg) {
  let js = arg[0];
  let path = arg[1];
  console.log(path);
  let xml = builder.buildObject(js);
  // console.log(xml);
  fs.writeFile(path, xml, function(err) {
    if (err) return console.log(err);
    console.log("Saved document");
    win.webContents.send("savedXML", "Succes saving XML");
  });
});

ipcMain.on("readID3", function(event, arg) {
  let file = arg[0];
  let cell = arg[1];
  (async () => {
    try {
      const metadata = await mm.parseFile(file);
      let picture = metadata.common.picture[0];
      const src = `data:${picture.format};base64,${picture.data.toString(
        "base64"
      )}`;

      win.webContents.send("showID3", [src, cell]);
    } catch (error) {
      console.error(error.message);
    }
  })();
});

ipcMain.on("readAudio", function(event, arg) {
  let path = arg;
  console.log(path);
  fs.readFile(path, function(err, buffer) {
    // var arr = new Uint8Array(buffer);
    // var buff = new Buffer.from(arr);
    // const buff = new Blob([arr]);
    // let arr = buffer;
    // var blob = new Blob([new Uint8Array(buffer)]);
    win.webContents.send("sendAudioBlob", buffer);
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
