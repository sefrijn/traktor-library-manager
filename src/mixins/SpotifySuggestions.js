export default {
	data() {
		return {
			spotifyGenres: [],
			apiDone: false,
		};
	},
	methods: {
		capitalize(str, lower = false) {
			return (lower
				? str.toLowerCase()
				: str
			).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
		},
	},
	created() {
		let self = this;
		window.ipcRenderer.send("spotifyGenres", [
			this.params.data.artist,
			this.params.data.title,
		]);

		window.ipcRenderer.receive("spotifyGenres", function(message) {
			console.log(message);
			if (message) {
				if (message.genres.length > 0) {
					self.spotifyGenres = message.genres.map(function(genre) {
						return self.capitalize(genre);
					});
					return;
				}
			}
			self.apiDone = true;
		});
	},
	beforeUnmount() {
		console.log("remove IPC listener");
		window.ipcRenderer.removeListener("spotifyGenres");
	},
};
