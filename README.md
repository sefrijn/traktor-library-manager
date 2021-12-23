# Traktor Library Manager

Manage your Traktor Pro 3 library with ease! Build with love by [DJ Sefrijn](https://mixcloud.com/sefrijn) from studio [How About Yes](https://howaboutyes.com).
Uses Vue, Tailwind, Electron, AG Grid and many more wonderful packages.

# Download [Mac](https://howaboutyes.com/traktor/mac) or [Windows](https://howaboutyes.com/traktor/win)

Like this project? Buy me a coffee

## Developer setup

To enable Spotify Integration during development, create a `src/config.js` file containing:

```
const client_id = ""; // Your client id
const client_secret = ""; // Your secret

export { client_secret, client_id };
```

The client ID & secret you get from creating a Spotify app:
https://developer.spotify.com/dashboard

After that you can run `yarn electron:serve` to start the watch server.

## Current status

-   [ ] Add playlist
-   [ ] Add folder
-   [ ] Add track to playlist
-   [ ] Preparation list
