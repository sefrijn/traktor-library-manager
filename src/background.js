"use strict";
/*
 * INDEX
 *
 * Imports & Variables
 * Electron Window Functions
 * IPC functions
 * - ALT FUNCTION FOR IMAGES
 */

// > Imports & Variables
import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { client_secret, client_id } from "./config.js";

const isDevelopment = process.env.NODE_ENV !== "production";
const { dialog, ipcMain, desktopCapturer } = require("electron");
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const mm = require("music-metadata");
const axios = require("axios");
const qs = require("qs");

let parser = new xml2js.Parser();
var builder = new xml2js.Builder({
  xmldec: { version: "1.0", encoding: "UTF-8", standalone: false },
});
let win = null;

// var authOptions = {
//   url: 'https://accounts.spotify.com/api/token',
//   headers: {
//     'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//   },
//   form: {
//     grant_type: 'client_credentials'
//   },
//   json: true
// };

// > Electron Window Functions
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
  console.log("node integration:");
  console.log(process.env.ELECTRON_NODE_INTEGRATION);
  win.setPosition(1280, 0);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools({ mode: "bottom" });
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  desktopCapturer
    .getSources({ types: ["window", "screen"] })
    .then(async (sources) => {
      for (const source of sources) {
        if (source.name == "Traktor") {
          console.log(
            "WARNING - traktor is open, close it before you continue to avoid any library conflict"
          );
        }
      }
    });
  let token = await spotifyApi();
  console.log("Token: " + token);
  // var options = {
  //     url: 'https://api.spotify.com/v1/users/jmperezperez',
  //     headers: {
  //       'Authorization': 'Bearer ' + token
  //     },
  //     json: true
  //   };
  await axios
    .get(
      "https://api.spotify.com/v1/search?q=Islandman+Drums+Colca&type=track",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
    .then(function(response) {
      console.log(response.data.tracks.items[0]);
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function spotifyApi() {
  const headers = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    auth: {
      username: client_id,
      password: client_secret,
    },
  };
  const data = {
    grant_type: "client_credentials",
  };

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify(data),
      headers
    );
    // console.log(response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.log(error);
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

// > IPC functions
ipcMain.on("openLibrary", function(event) {
  let file = dialog.showOpenDialogSync({
    title: "Find Library File",
    defaultPath: path.join(app.getPath("home"), "Music", "dj", "Traktor 3.4"),
    buttonLabel: "Open Library",
    properties: ["openFile"],
  });
  if (file == undefined) return console.log("no file selected, just continue");
  win.webContents.send("openLibrary", file);
});

ipcMain.on("parseXML", function(event, arg) {
  let file = arg[0];
  fs.readFile(file, function(err, data) {
    parser.parseString(data, function(err, result) {
      win.webContents.send("parseXML", result);
    });
  });
});

ipcMain.on("buildXML", function(event, arg) {
  let js = arg[0];
  let path = arg[1];
  let xml = builder.buildObject(js);
  fs.writeFile(path, xml, function(err) {
    if (err) return console.log(err);
    console.log("Saved document");
    win.webContents.send("buildXML", "Succes saving XML");
  });
});

// >> ALT FUNCTION FOR IMAGES
ipcMain.on("coverArtList", function(event, arg) {
  let files = arg[0];
  let images = {};
  (async () => {
    try {
      await Promise.all(
        Object.keys(files).map(async (index) => {
          const metadata = await mm.parseFile(files[index]);
          if (metadata.common.picture !== undefined) {
            let picture = metadata.common.picture[0];
            const src = `data:${picture.format};base64,${picture.data.toString(
              "base64"
            )}`;
            images[index] = src;
          } else {
            images[index] = undefined;
          }
        })
      );
      win.webContents.send("coverArtList", images);
    } catch (error) {
      console.error(error.message);
    }
  })();
});

ipcMain.on("coverArtSingle", function(event, arg) {
  let file = arg[0];
  (async () => {
    try {
      const metadata = await mm.parseFile(file);
      let picture = metadata.common.picture[0];
      const src = `data:${picture.format};base64,${picture.data.toString(
        "base64"
      )}`;

      win.webContents.send("coverArtSingle", [src]);
    } catch (error) {
      console.error(error.message);
    }
  })();
});

ipcMain.on("loadAudio", function(event, arg) {
  let path = arg;
  fs.readFile(path, function(err, buffer) {
    win.webContents.send("loadAudio", buffer);
  });
});
