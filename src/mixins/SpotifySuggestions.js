export default {
    data() {
        return {
            spotifyGenres: [],
            apiDone: false,
        };
    },
    methods: {
        capitalize(str, lower = false) {
            return (lower ? str.toLowerCase() : str).replace(
                /(?:^|\s|["'([{])+\S/g,
                (match) => match.toUpperCase()
            );
        },
    },
    created() {
        window.ipcRenderer.send('spotifyGenres', [
            this.params.data.artist,
            this.params.data.title,
        ]);

        window.ipcRenderer.receive('spotifyGenres', (artist) => {
            console.log(artist);
            if (artist) {
                if (artist.genres.length > 0) {
                    this.spotifyGenres = artist.genres.map((genre) => {
                        return this.capitalize(genre);
                    });
                    return;
                }
            }
            this.apiDone = true;
        });

        setTimeout(() => {
            this.apiDone = true;
        }, 3000);
    },
    beforeUnmount() {
        console.log('remove IPC listener');
        window.ipcRenderer.removeListener('spotifyGenres');
    },
};
