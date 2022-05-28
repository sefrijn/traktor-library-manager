import { contextBridge, ipcRenderer } from 'electron';

// whitelist channels
const validChannels = [
    'openLibrary',
    'parseXML',
    'buildXML',
    'coverArtProgress',
    'coverArtList',
    'coverArtSingle',
    'coverArtCell',
    'loadAudio',
    'traktorOpen',
    'saveWarning',
    'toClipboard',
    'spotifyGenres',
    'spotifyArtist',
    'openURL',
    'logError',
    'logWarning',
    'logInfo',
    'setVersion',
];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        let channelStripped = channel.replace(/[0-9]/g, '');
        if (validChannels.includes(channelStripped)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let channelStripped = channel.replace(/[0-9]/g, '');
        if (validChannels.includes(channelStripped)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    removeListener: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
    removeAllListeners: () => {
        ipcRenderer.removeAllListeners();
    },
});
