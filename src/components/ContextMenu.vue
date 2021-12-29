<template>
	<transition name="fade">
		<div
			v-if="contextMenu.show"
			@mouseenter="cancelHide"
			@mouseleave="hide"
			class="shadow-black rounded ring-4 ring-black ring-opacity-50 block fixed z-30 bg-indigo-900 p-2"
			style="min-width:175px;"
			:style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
		>
			<ul class="text-sm">
				<li
					v-for="action in contextMenu.actions"
					class="px-2 py-0.5 hover:bg-indigo-700 cursor-pointer"
					@click="click([action, contextMenu])"
				>
					{{
						action.charAt(0).toUpperCase() +
							action.slice(1).replace(/_/g, " ")
					}}
				</li>
			</ul>
		</div>
	</transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

<script>
const cloneDeep = require("lodash.clonedeep");

export default {
	data() {
		return {
			timer: null,
		};
	},
	computed: {
		contextMenu() {
			return this.$store.getters.contextMenu;
		},
	},
	methods: {
		click(args) {
			let commitName = args[1].source + args[0];
			this.$store.commit(commitName, args[1]);

			if (commitName === "griddelete_from_playlist") {
				this.$store.commit("setSaving", true);
				this.$store.commit("setLibraryPlaylist");

				let entries = this.$store.getters.playlistEntries[
					args[1].playlist
				];
				let tracks = [];
				for (const playlistTrack of entries) {
					let filename = playlistTrack.split("/:").pop();
					let index = parseInt(
						this.$store.getters.filenameToIndex[filename]
					);
					let track = this.$store.getters.collection[index];
					tracks.push(track);
				}
				this.$store.commit("setRowData", tracks);

				let libraryObj = cloneDeep(this.$store.getters.libraryFull);
				window.ipcRenderer.send("buildXML", [
					libraryObj,
					localStorage.pathToLibrary,
				]);
			}
		},
		hide() {
			this.timer = setTimeout(() => {
				let val = this.contextMenu;
				if (val.show) {
					val.show = false;
					this.$store.commit("setContextMenu", val);
				}
			}, 800);
		},
		cancelHide() {
			clearTimeout(this.timer);
		},
	},
	beforeUnmount() {
		clearTimeout(this.timer);
	},
};
</script>
