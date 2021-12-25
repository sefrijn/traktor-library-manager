<template>
  <li class="node-tree" v-if="folder.$.TYPE == 'FOLDER'">
    <div
      @click="toggleFolder"
      class="flex py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
    >
      <svg-icon
        v-if="!open"
        type="mdi"
        class="text-white"
        :path="iconFolderClose"
        size="18"
      ></svg-icon>
      <svg-icon
        v-if="open"
        class="text-white"
        type="mdi"
        :path="iconFolderOpen"
        size="18"
      ></svg-icon>
      <span>{{ folder.$.NAME == "$ROOT" ? "Playlists" : folder.$.NAME }}</span>
    </div>
    <ul
      class="pl-3"
      v-if="folder.SUBNODES[0].NODE && folder.SUBNODES[0].NODE.length && open"
    >
      <folder
        v-for="(child, index) in folder.SUBNODES[0].NODE"
        :folder="child"
        :depth="depth + 1"
        :index="index"
        :path="[...path, index]"
      ></folder>
    </ul>
  </li>
  <li class="playlist" v-if="folder.$.TYPE == 'PLAYLIST'">
    <div
      class="flex py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
      :class="{
        active: activePlaylist == folder.PLAYLIST[0].$.UUID,
      }"
      @click="openPlaylist(folder.PLAYLIST[0])"
    >
      <svg-icon
        type="mdi"
        class="flex-shrink-0 text-white"
        :path="iconPlaylist"
        size="18"
      ></svg-icon>
      <span>{{ folder.$.NAME }}</span>
      <button class="opacity-10 hover:opacity-100">
        <svg-icon type="mdi" :path="iconDelete" size="18"></svg-icon>
      </button>
      <button class="opacity-10 hover:opacity-100" @click="">
        <svg-icon type="mdi" :path="iconEdit" size="18"></svg-icon>
      </button>
    </div>
  </li>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiFolderOutline } from "@mdi/js";
import { mdiFolderOpenOutline } from "@mdi/js";
import { mdiPlaylistMusic } from "@mdi/js";
import { mdiPlaylistPlus } from "@mdi/js";
import { mdiDeleteOutline } from "@mdi/js";
import { mdiPencilOutline } from "@mdi/js";
import { mdiContentDuplicate } from "@mdi/js";

export default {
  name: "folder",
  props: {
    folder: Object,
    depth: Number,
    index: Number,
    path: Array,
  },
  components: {
    SvgIcon,
  },
  data() {
    return {
      iconFolderClose: mdiFolderOutline,
      iconFolderOpen: mdiFolderOpenOutline,
      iconPlaylist: mdiPlaylistMusic,
      iconPreparation: mdiPlaylistPlus,
      iconDuplicate: mdiContentDuplicate,
      iconEdit: mdiPencilOutline,
      iconDelete: mdiDeleteOutline,
      open: false,
    };
  },
  computed: {
    activePlaylist() {
      return this.$store.getters.activePlaylist;
    },
  },
  mounted() {
    if (this.folder.$.NAME == "$ROOT") {
      this.open = true;
    }
  },
  methods: {
    toggleFolder() {
      this.open = !this.open;
    },
    openPlaylist(list) {
      this.$store.commit("setFilter", { rating: 0, color: 0 });
      this.$store.commit("setActivePlaylist", list.$.UUID);
      console.log("open list " + list.$.UUID);

      let tracks = [];
      for (const playlistTrack of list.ENTRY) {
        let filename = playlistTrack.PRIMARYKEY[0].$.KEY.split("/:").pop();
        let index = parseInt(this.$store.state.filenameToIndex[filename]);
        let track = this.$store.state.collection[index];
        tracks.push(track);
      }
      this.$store.commit("setRowData", tracks);
    },
  },
};
</script>
