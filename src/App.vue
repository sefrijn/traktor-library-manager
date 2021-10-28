<template>
  <div class="h-screen bg-black-dark text-white font-sans">
    <app-header ref="header" style="height:100px;" @load="load"></app-header>

    <main class="flex">
      <aside class="border-r border-black w-1/4 flex flex-col justify-end">
        <div class="playlists flex-grow">
          lists
        </div>
        <div class="nowplaying text-xs font-medium text-center text-gray">
          <img :src="currentImageSrc" />
          <p class="px-4 py-3">{{ currentArtist }} - {{ currentTitle }}</p>
        </div>
      </aside>
      <section class="w-full relative" style="height: calc(100vh - 150px);">
        <ag-grid-vue
          ref="trackList"
          class="ag-theme-alpine-dark w-full"
          :class="classesGrid"
          :rowBuffer="5"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :row-data="rowData"
          :grid-options="gridOptions"
          @grid-ready="onGridReady"
          @viewport-changed="onViewportChanged"
          @cell-value-changed="onCellValueChanged"
          @cell-clicked="onCellClicked"
          @body-scroll="onBodyScroll"
          @grid-size-changed="onGridSizeChanged"
        >
        </ag-grid-vue>
        <visual-browser
          :class="classesVisualBrowser"
          :tracks="visibleTracks"
          :total="totalSongs"
          @play-track="playTrack"
        ></visual-browser>
      </section>
    </main>

    <app-footer
      style="height: 50px;"
      class="border-t border-black flex justify-center items-center"
      :path="pathToLibrary"
      :total="totalSongs"
    >
    </app-footer>
  </div>
</template>

<script>
window.ipcRenderer.removeAllListeners();

import { AgGridVue } from "ag-grid-vue3";
import { h, reactive, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import CoverArtRenderer from "./components/CoverArtRenderer.vue";
import VisualBrowser from "./components/VisualBrowser.vue";

import track_fields from "./components/columnHeaders.js";
import { column_defs } from "./components/columnDefs.js";

export default {
  name: "App",
  data() {
    return {
      pathToLibrary: "",

      library: null,
      libraryImageData: null,
      totalSongs: null,
      genres: [],
      trackLoaded: null,
      trackLoadedImage: null,

      columnDefs: null,
      rowData: null,
      gridApi: null,
      columnApi: null,
      gridOptions: null,
      defaultColDef: {
        editable: true,
      },
      track_fields: track_fields,
      src: null,
      visibleTracks: {},
    };
  },
  computed: {
    currentArtist() {
      return this.$store.state.artist;
    },
    currentTitle() {
      return this.$store.state.title;
    },
    currentImageSrc() {
      return this.$store.state.image;
    },
    display() {
      return this.$store.state.display;
    },
    classesGrid() {
      return {
        "h-full relative z-10": this.$store.state.display === "list",
        "h-1/2": this.$store.state.display === "split",
        "h-full relative z-0": this.$store.state.display === "grid",
      };
    },
    classesVisualBrowser() {
      return {
        "h-full absolute top-0 z-10": this.$store.state.display === "grid",
        "h-1/2": this.$store.state.display === "split",
        "h-full absolute top-0 z-0": this.$store.state.display === "list",
      };
    },
    scroll() {
      return this.$store.state.scroll.ratio;
    },
  },
  watch: {
    scroll(newscroll, oldscroll) {
      if (
        this.$store.state.scroll.source == "visualbrowser" &&
        this.$store.state.scroll.human
      ) {
        let h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;
        this.gridApi.gridBodyCon.eBodyViewport.scrollTop = newscroll * h;
      }
    },
  },
  components: {
    AgGridVue,
    CoverArtRenderer,
    AppHeader,
    AppFooter,
    VisualBrowser,
  },
  beforeMount() {
    this.gridOptions = {};
    this.columnDefs = column_defs;
  },
  methods: {
    onBodyScroll(event) {
      if (
        this.$store.state.scroll.source == "visualbrowser" &&
        this.$store.state.scroll.human
      ) {
        this.$store.commit("setHumanScroll", false);
        return;
      }
      let newScroll = {};
      let h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;

      newScroll.ratio = this.gridApi.gridBodyCon.eBodyViewport.scrollTop / h;
      newScroll.ratio = newScroll.ratio.toFixed(5);

      newScroll.source = "list";
      this.$store.commit("setHumanScroll", true);
      this.$store.commit("setScroll", newScroll);
    },
    load(event) {
      window.ipcRenderer.send("openLibrary", "trigger open file");
    },
    updateRowData(data) {
      this.rowData = data;
    },
    onGridReady(params) {
      this.gridApi = params.api;
      console.log("Grid ready");
      this.visibleTracks = this.gridApi.getRenderedNodes();
    },
    onGridSizeChanged(params) {
      console.log("onGridSizeChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    onViewportChanged(params) {
      console.log("onViewportChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    playTrack(filename, artist, title) {
      // this.$refs.header.emptyWavesurfer();
      window.ipcRenderer.send("loadAudio", filename);

      this.trackLoaded = filename;
      this.$store.commit("setArtist", artist);
      this.$store.commit("setTitle", title);
      // this.currentArtist = artist;
      // this.currentTitle = title;
      // this.currentTrack = this.currentArtist + " - " + this.currentTitle;
      window.ipcRenderer.send("coverArtSingle", [this.trackLoaded]);
    },
    onCellClicked(params) {
      if (params.colDef.field == this.track_fields[16]) {
        this.playTrack(
          params.data.filename,
          params.data.artist,
          params.data.title
        );
        // this.$store.commit("setTrue");
        // this.$refs.header.emptyWavesurfer();
        // window.ipcRenderer.send("loadAudio", params.data.filename);

        // this.trackLoaded = params.data.filename;
        // this.currentArtist = params.data.artist;
        // this.currentTitle = params.data.title;
        // this.currentTrack = this.currentArtist + " - " + this.currentTitle;
        // window.ipcRenderer.send("coverArtSingle", [this.trackLoaded]);
      }
    },
    onCellValueChanged(params) {
      console.log("You'v edited a cell");
      // console.log(params.data);

      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.rowIndex]["INFO"][0][
        "$"
      ]["GENRE"] = params.data.genre;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.rowIndex]["INFO"][0][
        "$"
      ]["COMMENT"] = params.data.comment_1;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.rowIndex]["INFO"][0][
        "$"
      ]["RATING"] = params.data.comment_2;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.rowIndex]["$"][
        "ARTIST"
      ] = params.data.artist;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.rowIndex]["$"][
        "TITLE"
      ] = params.data.title;

      let updatedLibrary = JSON.parse(JSON.stringify(this.library));
      window.ipcRenderer.send("buildXML", [
        updatedLibrary,
        localStorage.pathToLibrary,
      ]);
    },
  },
  mounted() {
    let self = this;

    if (localStorage.pathToLibrary) {
      this.pathToLibrary = localStorage.pathToLibrary;
      console.log(localStorage.pathToLibrary);
      window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
    }

    window.ipcRenderer.receive("openLibrary", function(message) {
      localStorage.pathToLibrary = message;
      self.pathToLibrary = message;
      console.log(message);
      window.ipcRenderer.send("parseXML", message);
    });

    window.ipcRenderer.receive("buildXML", function(message) {
      console.log(message);
    });

    window.ipcRenderer.receive("coverArtList", (images) => {
      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let collectionFiltered = [];
      collection.forEach(function(track, index) {
        let genre = track["INFO"][0]["$"]["GENRE"];
        if (self.genres.indexOf(genre) < 0 && genre != undefined)
          self.genres.push(genre);
        collectionFiltered[index] = {
          [self.track_fields[16]]: index,
          [self.track_fields[1]]: track["$"]["ARTIST"],
          [self.track_fields[2]]: track["$"]["TITLE"],
          [self.track_fields[5]]: genre,
          [self.track_fields[6]]: track["INFO"][0]["$"]["COMMENT"],
          [self.track_fields[7]]: track["INFO"][0]["$"]["RATING"],
          [self.track_fields[8]]: track["INFO"][0]["$"]["RANKING"] / 51,
          [self.track_fields[9][0]]: track["INFO"][0]["$"]["COLOR"],
          [self.track_fields[10]]:
            typeof track["MUSICAL_KEY"] === "undefined"
              ? 0
              : track["MUSICAL_KEY"][0]["$"]["VALUE"],
          [self.track_fields[11]]:
            typeof track["TEMPO"] === "undefined"
              ? ""
              : Math.round(track["TEMPO"][0]["$"]["BPM"] * 100) / 100,
          [self.track_fields[12]]: track["INFO"][0]["$"]["IMPORT_DATE"],
          [self.track_fields[14]]:
            track["LOCATION"][0]["$"]["DIR"].replace(/:/g, "") +
            track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":"),
          [self.track_fields[15]]: images[index],
        };
      });
      self.updateRowData(collectionFiltered);
      self.totalSongs = Object.keys(collectionFiltered).length;
    });

    window.ipcRenderer.receive("parseXML", (message) => {
      self.library = message;

      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let paths = {};
      collection.forEach(function(track, index) {
        paths[index] =
          track["LOCATION"][0]["$"]["DIR"].replace(/:/g, "") +
          track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");
      });

      window.ipcRenderer.send("coverArtList", [
        JSON.parse(JSON.stringify(paths)),
      ]);
    });

    window.ipcRenderer.receive("coverArtSingle", function(picture) {
      self.$store.commit("setImage", picture);
    });
  },
};
</script>

<style lang="scss"></style>
