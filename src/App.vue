<template>
  <div class="h-screen bg-black-dark text-white font-sans">
    <app-header
      ref="header"
      style="height:82px;"
      @save="save"
      @load="load"
    ></app-header>

    <main class="flex" @mouseup="endDragging">
      <aside
        v-if="sidebar"
        class="max-w-sm flex flex-col justify-between"
        style="height: calc(100vh - 132px);"
        :style="{ width: `${asideWidth}%` }"
      >
        <browser :playlists="playlists"></browser>
        <div
          class="border-t border-black-medium nowplaying text-xs font-medium text-center text-gray"
        >
          <img v-if="image" :src="image" />
          <p v-if="artist" class="px-4 py-3">{{ artist }} - {{ title }}</p>
        </div>
      </aside>
      <div
        v-if="sidebar"
        class="divider w-2 flex justify-center items-center bg-black-medium hover:bg-black-light cursor-divider-h"
        @mousedown="startDragging"
      >
        <img src="./assets/vsizegrip.png" alt="" />
      </div>
      <section class="flex-grow relative" style="height: calc(100vh - 132px);">
        <ag-grid-vue
          ref="trackList"
          class="ag-theme-alpine-dark w-full border-t border-l border-black-dark"
          :class="classesGrid"
          :rowBuffer="10"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :suppress-scroll-on-new-data="preventScroll"
          :row-data="rowData"
          :row-class-rules="rowClassRules"
          :grid-options="gridOptions"
          @grid-ready="onGridReady"
          @viewport-changed="onViewportChanged"
          @cell-value-changed="onCellValueChanged"
          @cell-editing-started="onCellEditingStarted"
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
      library: null, // NML Traktor collection XML converted to JSON (unfiltered for AG grid)
      pathToLibrary: "", // Selected NML library file
      totalSongs: null, // Amount of tracks in collection
      genres: [], // List of used genres for autocomplete

      columnDefs: null, // AG Grid column settings
      //rowData: null, // AG Grid row content
      gridApi: null, // AG Grid methods
      gridOptions: null, // AG Grid general setings
      defaultColDef: {
        editable: true,
        sortable: true,
      },
      src: null,
      visibleTracks: {},
      asideWidth: 20,
      rowClassRules: null, // styling of rows

      playlists: null,

      // columnApi: null, // AG Grid column methods
    };
  },
  computed: {
    preventScroll() {
      return this.$store.state.preventScroll;
    },
    collection() {
      return this.$store.state.collection;
    },
    rowData() {
      return this.$store.state.rowData;
    },
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
    this.rowClassRules = {
      "color-1": (params) => {
        return params.data.color_code == 1;
      },
      "color-2": (params) => {
        return params.data.color_code == 2;
      },
      "color-3": (params) => {
        return params.data.color_code == 3;
      },
      "color-4": (params) => {
        return params.data.color_code == 4;
      },
      "color-5": (params) => {
        return params.data.color_code == 5;
      },
      "color-6": (params) => {
        return params.data.color_code == 6;
      },
      "color-7": (params) => {
        return params.data.color_code == 7;
      },
    };
  },
  methods: {
    onBodyScroll(event) {
      console.log("scrolling");
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
    // updateRowData(data) {
    //   console.log("updateRowData");
    //   this.$store.commit("setRowData", data);
    //   // this.rowData = data;
    // },
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
      // console.log(this.$store.state.rowData.length);
      if (this.$store.state.rowData != null) {
        this.totalSongs = this.$store.state.rowData.length;
      }
      console.log("set visibleTracks - onViewportChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    playTrack(track) {
      if (track.index != this.$store.state.trackPlaying.index) {
        this.$store.commit("setTrackPlaying", track);
        this.$store.commit("setLoading", true);
        window.ipcRenderer.send("loadAudio", track.path + track.filename);
      }
    },
    onCellClicked(params) {
      if (params.colDef.field == "index") {
        this.playTrack(params.data);
      }
    },
    onCellEditingStarted(params) {
      this.$store.commit("setPreventScroll", true);
      console.log("started editing");
    },
    onCellValueChanged(params) {
      this.$store.commit("setSaving", true);
      // this.$store.commit("setPreventScroll", true);

      console.log("You'v edited a cell");

      let self = this;
      setTimeout(function() {
        self.save(params);
      }, 5);
    },
    save(params) {
      let self = this;
      this.$store.commit("setSaving", true);
      console.log("Save these changes:");
      console.log(params.data);

      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["COLOR"] = params.data.color_code;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["RANKING"] = params.data.rating * 51;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["GENRE"] = params.data.genre;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["COMMENT"] = params.data.comment_1;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["RATING"] = params.data.comment_2;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index]["$"][
        "ARTIST"
      ] = params.data.artist;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index]["$"][
        "TITLE"
      ] = params.data.title;

      // Update Genres
      if (params.column.colId == "genre") {
        console.log("rebuild genre autocomplete");
        self.$store.commit("clearAllGenres", true);
        let collection = this.library["NML"]["COLLECTION"][0]["ENTRY"];
        collection.forEach(function(track, index) {
          let genre = track["INFO"][0]["$"]["GENRE"];
          if (
            self.$store.state.genres.indexOf(genre) < 0 &&
            genre != undefined &&
            genre != ""
          )
            self.$store.commit("addGenre", genre);
        });
      }

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
      self.$store.commit("setSaving", false);
      self.$store.commit("setPreventScroll", false);
    });

    window.ipcRenderer.receive("coverArtList", (message) => {
      // >> Create collection data
      // console.log(message);
      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let collectionFiltered = [];
      let filenameToIndex = {};
      collection.forEach(function(track, index) {
        let genre = track["INFO"][0]["$"]["GENRE"];
        let filename = track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");
        if (
          self.$store.state.genres.indexOf(genre) < 0 &&
          genre != undefined &&
          genre != ""
        )
          self.$store.commit("addGenre", genre);
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
          ["color_code"]: track["INFO"][0]["$"]["COLOR"],
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
          ["image"]:
            message[index].file == null
              ? null
              : filename.substring(0, filename.lastIndexOf(".")) + ".jpeg",
          ["filename"]: filename,
          ["cue_points"]: track["CUE_V2"],
        };
        filenameToIndex[filename] = index;
      });
      this.$store.commit("setCollection", collectionFiltered);
      // console.log("setRowData");
      this.$store.commit("setRowData", collectionFiltered);
      this.$store.commit("setFilenameToIndex", filenameToIndex);

      // >> Create playlist data
      this.playlists = self.library["NML"]["PLAYLISTS"][0]["NODE"][0];
      // console.log(this.playlists);
      // console.log(collectionFiltered);
      // console.log(this.$store.state.genres);

      // self.updateRowData(collectionFiltered);
      self.totalSongs = Object.keys(collectionFiltered).length;
    });

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
      window.ipcRenderer.send("coverArtList", [
        JSON.parse(JSON.stringify(paths)),
      ]);
    });
  },
};
</script>

<style lang="scss"></style>
