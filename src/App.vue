<template>
  <div class="h-screen bg-black-dark text-white font-sans">
    <app-header ref="header" style="height:82px;" @load="load"></app-header>

    <main class="flex" @mouseup="endDragging">
      <aside
        v-if="sidebar"
        class="max-w-sm flex flex-col justify-end"
        :style="{ width: `${asideWidth}%` }"
      >
        <browser></browser>
        <div class="nowplaying text-xs font-medium text-center text-gray">
          <img v-if="image" :src="image" />
          <p v-if="artist" class="px-4 py-3">{{ artist }} - {{ title }}</p>
        </div>
      </aside>
      <div
        v-if="sidebar"
        class="divider w-2 flex justify-center items-center bg-black-light hover:bg-gray-dark cursor-divider-h"
        @mousedown="startDragging"
      >
        <img src="./assets/vsizegrip.png" alt="" />
      </div>
      <section class="flex-grow relative" style="height: calc(100vh - 132px);">
        <ag-grid-vue
          ref="trackList"
          class="ag-theme-alpine-dark w-full"
          :class="classesGrid"
          :rowBuffer="10"
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
import Browser from "./components/Browser.vue";
import VisualBrowser from "./components/VisualBrowser.vue";

import { column_defs } from "./components/columnDefs.js";

export default {
  name: "App",
  components: {
    AgGridVue,
    AppHeader,
    AppFooter,
    VisualBrowser,
    Browser,
  },
  data() {
    return {
      library: null, // NML Traktor collection XML converted to JSON
      pathToLibrary: "", // Selected NML library file
      totalSongs: null, // Amount of tracks in collection
      genres: [], // List of used genres for autocomplete

      columnDefs: null, // AG Grid column settings
      rowData: null, // AG Grid row content
      gridApi: null, // AG Grid methods
      gridOptions: null, // AG Grid general setings
      defaultColDef: {
        editable: true,
        sortable: true,
      },
      src: null,
      visibleTracks: {},
      asideWidth: 20,

      // columnApi: null, // AG Grid column methods
    };
  },
  computed: {
    sidebar() {
      return this.$store.state.sidebar;
    },
    query() {
      return this.$store.state.query;
    },
    artist() {
      return this.$store.state.trackPlaying.artist;
    },
    title() {
      return this.$store.state.trackPlaying.title;
    },
    image() {
      return this.$store.state.trackPlaying.image
        ? "local-resource://coverart/400/" +
            this.$store.state.trackPlaying.image
        : null;
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
    query(newtext, oldtext) {
      this.gridApi.setQuickFilter(newtext);
    },
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
    handleDragging(e) {
      const percentage = (e.pageX / window.innerWidth) * 100;
      if (percentage >= 10 && percentage <= 90) {
        this.asideWidth = percentage.toFixed(2);
      }
    },
    startDragging(event) {
      document.addEventListener("mousemove", this.handleDragging);
    },
    endDragging() {
      document.removeEventListener("mousemove", this.handleDragging);
    },
    updateRowData(data) {
      this.rowData = data;
    },
    onGridReady(params) {
      this.gridApi = params.api;
      console.log("set visibleTracks - onGridReady");
      this.visibleTracks = this.gridApi.getRenderedNodes();
    },
    onGridSizeChanged(params) {
      console.log("set visibleTracks - onGridSizeChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    onViewportChanged(params) {
      console.log("set visibleTracks - onViewportChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    playTrack(track) {
      this.$store.commit("setTrackPlaying", track);
      this.$store.commit("setLoading", true);
      window.ipcRenderer.send("loadAudio", track.path + track.filename);
    },
    onCellClicked(params) {
      if (params.colDef.field == "index") {
        this.playTrack(params.data);
      }
    },
    onCellValueChanged(params) {
      console.log("You'v edited a cell");

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

    // >> Save images locally in Userdata
    window.ipcRenderer.receive("coverArtList", (message) => {
      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let collectionFiltered = [];
      collection.forEach(function(track, index) {
        let genre = track["INFO"][0]["$"]["GENRE"];
        let filename = track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");
        if (self.genres.indexOf(genre) < 0 && genre != undefined)
          self.genres.push(genre);
        collectionFiltered[index] = {
          ["index"]: index,
          ["artist"]: track["$"]["ARTIST"],
          ["title"]: track["$"]["TITLE"],
          ["genre"]: genre,
          ["comment_1"]: track["INFO"][0]["$"]["COMMENT"],
          ["comment_2"]: track["INFO"][0]["$"]["RATING"],
          ["rating"]: track["INFO"][0]["$"]["RANKING"]
            ? track["INFO"][0]["$"]["RANKING"] / 51
            : 0,
          ["color"]: track["INFO"][0]["$"]["COLOR"],
          ["musical_key"]:
            typeof track["MUSICAL_KEY"] === "undefined"
              ? 0
              : track["MUSICAL_KEY"][0]["$"]["VALUE"],
          ["bpm"]:
            typeof track["TEMPO"] === "undefined"
              ? ""
              : Math.round(track["TEMPO"][0]["$"]["BPM"] * 100) / 100,
          ["import_date"]: track["INFO"][0]["$"]["IMPORT_DATE"],
          ["path"]: track["LOCATION"][0]["$"]["DIR"].replace(/:/g, ""),
          ["image"]: filename.substring(0, filename.lastIndexOf(".")) + ".jpeg",
          ["filename"]: filename,
          ["cue_points"]: track["CUE_V2"],
        };
      });
      // console.log(collectionFiltered);
      self.updateRowData(collectionFiltered);
      self.totalSongs = Object.keys(collectionFiltered).length;
    });

    // >> LOAD ALL IMAGES AT ONCE
    // window.ipcRenderer.receive("coverArtList", (images) => {
    //   let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
    //   let collectionFiltered = [];
    //   collection.forEach(function(track, index) {
    //     let genre = track["INFO"][0]["$"]["GENRE"];
    //     if (self.genres.indexOf(genre) < 0 && genre != undefined)
    //       self.genres.push(genre);
    //     collectionFiltered[index] = {
    //       [self.track_fields[16]]: index,
    //       [self.track_fields[1]]: track["$"]["ARTIST"],
    //       [self.track_fields[2]]: track["$"]["TITLE"],
    //       [self.track_fields[5]]: genre,
    //       [self.track_fields[6]]: track["INFO"][0]["$"]["COMMENT"],
    //       [self.track_fields[7]]: track["INFO"][0]["$"]["RATING"],
    //       [self.track_fields[8]]: track["INFO"][0]["$"]["RANKING"] / 51,
    //       [self.track_fields[9][0]]: track["INFO"][0]["$"]["COLOR"],
    //       [self.track_fields[10]]:
    //         typeof track["MUSICAL_KEY"] === "undefined"
    //           ? 0
    //           : track["MUSICAL_KEY"][0]["$"]["VALUE"],
    //       [self.track_fields[11]]:
    //         typeof track["TEMPO"] === "undefined"
    //           ? ""
    //           : Math.round(track["TEMPO"][0]["$"]["BPM"] * 100) / 100,
    //       [self.track_fields[12]]: track["INFO"][0]["$"]["IMPORT_DATE"],
    //       [self.track_fields[14]]:
    //         track["LOCATION"][0]["$"]["DIR"].replace(/:/g, "") +
    //         track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":"),
    //       [self.track_fields[15]]: images[index],
    //     };
    //   });
    //   self.updateRowData(collectionFiltered);
    //   self.totalSongs = Object.keys(collectionFiltered).length;
    // });

    window.ipcRenderer.receive("parseXML", (message) => {
      self.library = message;

      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let paths = {};
      collection.forEach(function(track, index) {
        paths[index] = {
          path: track["LOCATION"][0]["$"]["DIR"].replace(/:/g, ""),
          file: track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":"),
        };
      });
      // paths = Object.entries(paths).slice(-15);
      // console.log(paths);
      window.ipcRenderer.send("coverArtList", [
        JSON.parse(JSON.stringify(paths)),
      ]);
    });
    // END LOAD ALL IMAGES AT ONCE

    // window.ipcRenderer.receive("coverArtSingle", function(picture) {
    //   self.$store.commit("setImage", picture);
    // });
  },
};
</script>

<style lang="scss"></style>
