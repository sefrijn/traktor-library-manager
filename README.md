# Traktor Library Manager 0.9.6

Manage your Traktor Pro 3 library with ease! Build with love by [DJ Sefrijn](https://mixcloud.com/sefrijn) from studio [How About Yes](https://howaboutyes.com).
Uses Vue, Tailwind, Electron, AG Grid and many more wonderful packages.

This projects is still in Beta testing.

# Download [Mac](https://howaboutyes.com/projects/traktor-library-manager/)

Like this project? [Buy me a coffee](https://ko-fi.com/sefrijn)

## Developer setup

To run a dev server on local machine:

```
yarn
yarn electron:serve
```

To enable Spotify Integration during development, create a `src/config.js` file containing:

```
const client_id = ""; // Your client id
const client_secret = ""; // Your secret

export { client_secret, client_id };
```

The client ID & secret you get from creating a Spotify app:
https://developer.spotify.com/dashboard
