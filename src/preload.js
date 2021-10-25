import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
	send: (channel, data) => {
		// whitelist channels
		let validChannels = [
			"toMain",
			"parseXML",
			"buildXML",
			"readID3",
			"readAudio",
		];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	receive: (channel, func) => {
		let validChannels = [
			"fromMain",
			"sendJSobject",
			"savedXML",
			"showID3",
			"sendAudioBlob",
		];
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
});
