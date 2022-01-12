"use strict";
/*
 * INDEX
 *
 * Imports & Variables
 * Electron Window Functions
 * IPC functions
 * - Spotify Genres
 * - Spotify Artist URL
 * - Generate Cover Art
 */

// > Imports & Variables
import { app, protocol, BrowserWindow, clipboard, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { client_secret, client_id } from "./config.js"; // Spotify

const isDevelopment = process.env.NODE_ENV !== "production";
const { dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const xml2js = require("xml2js");
const mm = require("music-metadata");
const axios = require("axios");
const qs = require("qs");
const sharp = require("sharp");
const si = require("systeminformation");
const pjson = require("./../package.json");

let parser = new xml2js.Parser();
var builder = new xml2js.Builder({
  xmldec: { version: "1.0", encoding: "UTF-8", standalone: false },
});
let win = null;
let token = null;

const debugLimitImages = 5000;

// > Electron Window Functions

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
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

  token = await spotifyApi();
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
  registerLocalResourceProtocol();

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
    defaultPath: app.getPath("home"),
    buttonLabel: "Open Library",
    properties: ["openFile"],
  });
  if (file == undefined) return console.log("no file selected, just continue");
  win.webContents.send("openLibrary", file);
  // if (file) {
  //   const d = new Date();
  //   let month = d.getMonth();
  //   let year = d.getFullYear();
  //   let backup = file.replace(".nml", "-" + month + year + ".nml");
  //   fs.copyFile(file, backup, (err) => {
  //     if (err) throw err;
  //     console.log("source.txt was copied to destination.txt");
  //   });
  // }
});

ipcMain.on("setVersion", function(event, arg) {
  console.log(pjson.version);
  win.webContents.send("setVersion", pjson.version);
});

ipcMain.on("parseXML", function(event, arg) {
  let file = arg[0];
  const dateRaw = new Date();
  const date =
    dateRaw.getFullYear() +
    ("0" + (dateRaw.getMonth() + 1)).slice(-2) +
    ("0" + dateRaw.getDate()).slice(-2);
  let backup = file.replace(".nml", "-manager-backup-" + date + ".nml");

  try {
    if (!fs.existsSync(backup)) {
      console.log("copy file: " + file);
      fs.copyFile(file, backup, (err) => {
        if (err) throw err;
        console.log("Collection backup created for today: " + date);
      });
    } else {
      console.log("Collection backup already created for today");
    }
  } catch (err) {
    console.error(err);
  }

  fs.readFile(file, function(err, data) {
    parser.parseString(data, function(err, result) {
      win.webContents.send("parseXML", result);
    });
  });
});

ipcMain.on("buildXML", function(event, arg) {
  let js = arg[0];
  let path = arg[1];
  let message = arg.length > 2 ? ": " + arg[2] : "";
  let xml = builder.buildObject(js);
  fs.writeFile(path, xml, function(err) {
    if (err) return console.log(err);
    console.log("Saved document");
    win.webContents.send("buildXML", "XML Saved" + message);
  });
});

ipcMain.on("traktorOpen", function(event, arg) {
  si.processes()
    .then((data) => {
      let result = data.list.find((obj) => {
        return obj.name === "Traktor";
      });
      if (result) {
        win.webContents.send("traktorOpen", true);
      } else {
        win.webContents.send("traktorOpen", false);
      }
    })
    .catch((error) => console.error(error));
});

ipcMain.on("saveWarning", function(event, arg) {
  dialog.showMessageBoxSync({
    title: "Saving disabled",
    message:
      "Traktor is opened. Your changes will not be saved to database. This is a safety feature to prevent conflicting changes.",
  });
});

ipcMain.on("spotifyGenres", async function(event, arg) {
  let artist = arg[0];
  let title = arg[1];
  // >> Spotify Genres
  let query = artist.replace(/ /g, "+");
  await axios
    .get("https://api.spotify.com/v1/search?q=" + query + "&type=artist", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then(function(response) {
      let result = response.data.artists.items[0];
      win.webContents.send("spotifyGenres", result);
    })
    .catch(function(error) {
      console.log(error);
    });
});

ipcMain.on("spotifyArtist", async function(event, artist) {
  // >> Spotify Artist URL
  let query = artist.replace(/ /g, "+");
  await axios
    .get("https://api.spotify.com/v1/search?q=" + query + "&type=artist", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then(function(response) {
      let result = response.data.artists.items[0];
      if (result && result.external_urls && result.external_urls.spotify) {
        let url = result.external_urls.spotify;
        console.log("Open artist URL: " + url);
        shell.openExternal(url);
      } else {
        console.log("No artist URL");
        win.webContents.send("spotifyArtist", false);
      }
    })
    .catch(function(error) {
      console.log(error);
      win.webContents.send("spotifyArtist", false);
    });
});

ipcMain.on("openURL", (event, url) => {
  shell.openExternal(url);
});

ipcMain.on("toClipboard", function(event, arg) {
  console.log("copy to clipboard: " + arg);
  clipboard.writeText(arg);
});

// >> Generate Cover Art
// Large
const sizeL = 400;
const imgL = path.join(app.getPath("userData"), "coverart", sizeL.toString());
if (!fs.existsSync(imgL)) {
  fs.mkdirSync(imgL, { recursive: true });
}

// medium
const sizeM = 200;
const imgM = path.join(app.getPath("userData"), "coverart", sizeM.toString());
if (!fs.existsSync(imgM)) {
  fs.mkdirSync(imgM, { recursive: true });
}

// Small
const sizeS = 60;
const imgS = path.join(app.getPath("userData"), "coverart", sizeS.toString());
if (!fs.existsSync(imgS)) {
  fs.mkdirSync(imgS, { recursive: true });
}

ipcMain.on("coverArtList", async function(event, files) {
  let counter = 0;
  const total = files.length;

  // Check which files exist on disk
  for (const index in files) {
    if (fs.existsSync(files[index].path + files[index].file)) {
      // File Exists on Disk

      // Check if coverart is already generated
      let s = path.join(imgS, path.parse(files[index].file).name + ".jpeg");
      let m = path.join(imgM, path.parse(files[index].file).name + ".jpeg");
      let l = path.join(imgL, path.parse(files[index].file).name + ".jpeg");
      if (!fs.existsSync(s) || !fs.existsSync(m) || !fs.existsSync(l)) {
        // Coverart does not exist on disk
        // Read metadata from audiofile
        const meta = await mm.parseFile(files[index].path + files[index].file);
        if (meta.common.picture !== undefined) {
          // The track has an image! Write it to disk
          let picture = meta.common.picture[0];
          // Small
          sharp(picture.data)
            .resize(sizeS, sizeS)
            .jpeg({ quality: 75 })
            .toFile(s);
          // Medium
          sharp(picture.data)
            .resize(sizeM, sizeM)
            .jpeg({ quality: 75 })
            .toFile(m);
          // Large
          sharp(picture.data)
            .resize(sizeL, sizeL)
            .jpeg({ quality: 75 })
            .toFile(l);
        } else {
          win.webContents.send(
            "logWarning",
            "File " +
              index +
              " has no Coverart: " +
              files[index].path +
              files[index].file
          );
          files[index].file = null;
        }
      }
    } else {
      win.webContents.send(
        "logError",
        "File " +
          index +
          " not found on disk: " +
          files[index].path +
          files[index].file
      );
      files[index].file = null;
    }

    counter++;
    if (counter < total)
      win.webContents.send("coverArtProgress", counter / total);
  }

  win.webContents.send("coverArtProgress", 1);
  win.webContents.send("coverArtList", files);
});

function registerLocalResourceProtocol() {
  // console.log("started register protocol");
  protocol.registerFileProtocol("local-resource", (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, "");
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url); // Needed in case URL contains spaces
    // console.log(decodedUrl);
    try {
      return callback(path.join(app.getPath("userData"), decodedUrl));
    } catch (error) {
      console.error(
        "ERROR: registerLocalResourceProtocol: Could not get file path:",
        error
      );
    }
  });
}

ipcMain.on("loadAudio", function(event, path) {
  fs.readFile(path, function(err, buffer) {
    win.webContents.send("loadAudio", buffer);
  });
});
