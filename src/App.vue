<template>
  <div class="h-screen bg-black-dark text-white font-sans">
    <app-header ref="header" style="height:67px;"></app-header>

    <main class="flex relative" @mouseup="endDragging">
      <welcome style="height: calc(100vh - 134px);"> </welcome>

      <generate-cover-art style="height: calc(100vh - 134px);">
      </generate-cover-art>

      <aside
        v-if="sidebar && pathToLibrary"
        class="max-w-sm flex flex-col justify-between"
        :style="{ width: `${asideWidth}%` }"
        style="height: calc(100vh - 134px);"
      >
        <browser :playlists="playlists"></browser>
        <now-playing></now-playing>
      </aside>

      <div
        v-if="sidebar && pathToLibrary"
        class="divider w-2 flex justify-center items-center bg-black-medium hover:bg-black-light cursor-divider-h"
        @mousedown="startDragging"
      >
        <img src="./assets/vsizegrip.png" alt="" />
      </div>

      <section
        v-if="pathToLibrary"
        class="flex-grow relative"
        style="height: calc(100vh - 134px);"
        @wheel="setScrollSource"
      >
        <ag-grid-vue
          ref="trackList"
          class="ag-theme-alpine-dark w-full border-t border-l border-black-dark"
          :class="classesGrid"
          :rowBuffer="5"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :suppress-scroll-on-new-data="preventScroll"
          :row-data="rowData"
          :row-class-rules="rowClassRules"
          :grid-options="gridOptions"
          :rowDragManaged="true"
          :rowDragMultiRow="true"
          :rowSelection="`multiple`"
          @grid-ready="onGridReady"
          @viewport-changed="onViewportChanged"
          @cell-value-changed="onCellValueChanged"
          @cell-editing-started="onCellEditingStarted"
          @cell-editing-stopped="onCellEditingStopped"
          @cell-clicked="onCellClicked"
          @body-scroll="onBodyScroll"
          @grid-size-changed="onGridSizeChanged"
          @filter-changed="onFilterChanged"
        >
        </ag-grid-vue>
        <visual-browser
          @scroll="onBodyScroll"
          ref="visualbrowser"
          :class="classesVisualBrowser"
          :tracks="visibleTracks"
          :filtered-songs="filteredSongs"
          @play-track="playTrack"
        ></visual-browser>
      </section>
    </main>

    <app-footer
      style="height: 67px;"
      class="border-t border-black flex justify-center items-center"
      :filtered-songs="filteredSongs"
      :total-songs="totalSongs"
    >
    </app-footer>
  </div>
</template>

<script>
window.ipcRenderer.removeAllListeners();

import { AgGridVue } from "ag-grid-vue3";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import Browser from "./components/Browser.vue";
import VisualBrowser from "./components/VisualBrowser.vue";
import Welcome from "./components/Welcome.vue";
import GenerateCoverArt from "./components/GenerateCoverArt.vue";
import NowPlaying from "./components/NowPlaying.vue";
import { column_defs, ag_components } from "./components/columnDefs.js";
import tinykeys from "tinykeys";
import { throttle } from "throttle-debounce";

export default {
  name: "App",
  components: {
    AgGridVue,
    AppHeader,
    AppFooter,
    VisualBrowser,
    Browser,
    Welcome,
    GenerateCoverArt,
    NowPlaying,
  },
  data() {
    return {
      library: null, // JS Object - NML Traktor collection XML converted to JSON
      totalSongs: null, // INT - All tracks in collection
      filteredSongs: null, // INT - Tracks within playlist, filter and search
      columnDefs: null, // JS Object - AG Grid column settings
      gridApi: null, // JS Object - AG Grid methods
      gridOptions: null, // JS Object - AG Grid general setings
      defaultColDef: {
        editable: true,
        sortable: true,
        filter: true,
      },
      visibleTracks: {},
      asideWidth: 20, // Number - percentage
      rowClassRules: null, // styling of rows
      playlists: null,
      unsubscribe: null,
      traktorOpen: null, // Boolean
      scrollSource: null,
    };
  },
  computed: {
    pathToLibrary() {
      return this.$store.getters.libraryPath;
    },
    preventScroll() {
      return this.$store.getters.preventScroll;
    },
    isSavingEnabled() {
      return this.$store.getters.savingEnabled;
    },
    collection() {
      return this.$store.state.collection;
    },
    rowData() {
      return this.$store.state.rowData;
    },
    sidebar() {
      return this.$store.getters.sidebar;
    },
    query() {
      return this.$store.state.query;
    },
    filter() {
      return this.$store.state.filter;
    },
    display() {
      return this.$store.getters.display;
    },
    classesGrid() {
      return {
        "h-full relative z-10": this.display === "list",
        "h-1/2": this.display === "split",
        "h-full relative z-0": this.display === "visualbrowser",
      };
    },
    classesVisualBrowser() {
      return {
        "h-full absolute top-0 z-10": this.display === "visualbrowser",
        "h-1/2": this.display === "split",
        "h-full absolute top-0 z-0": this.display === "list",
      };
    },
  },
  watch: {
    isSavingEnabled(newval, oldval) {
      let self = this;
      this.columnDefs.forEach(function(colDef, index) {
        if (newval && !colDef.hasOwnProperty("editable")) {
          self.columnDefs[index].editable = true;
        } else {
          if (self.columnDefs[index].editable) {
            delete self.columnDefs[index].editable;
          }
        }
      });
    },
    query(newtext, oldtext) {
      this.gridApi.setQuickFilter(newtext);
    },
    filter(newval, oldval) {
      if (newval.rating <= 0 && newval.color <= 0)
        this.gridApi.setFilterModel(null);
      else {
        let filter = {};
        if (newval.rating > 0) {
          filter.rating = {
            type: "set",
            filter: newval.rating,
          };
        }
        if (newval.color > 0) {
          filter.color_code = {
            type: "set",
            filter: newval.color,
          };
        }
        this.gridApi.setFilterModel(filter);
      }
    },
  },
  beforeMount() {
    this.gridOptions = {
      components: ag_components,
    };
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

    if (localStorage.display) {
      this.$store.commit("setDisplay", localStorage.display);
    }

    this.unsubscribe = tinykeys(window, {
      "$mod+F": () => {
        this.$refs.header.$refs.search.$refs.input.focus();
      },
    });
  },
  methods: {
    setScrollSource: throttle(20, function(event) {
      let splitHeight = (window.innerHeight - 134) / 2 + 67;

      if (this.display === "list" && this.scrollSource !== "list") {
        this.scrollSource = "list";
      }

      if (
        this.display === "visualbrowser" &&
        this.scrollSource !== "visualbrowser"
      ) {
        this.scrollSource = "visualbrowser";
      }

      if (this.display === "split") {
        if (event.clientY < splitHeight && this.scrollSource !== "list") {
          this.scrollSource = "list";
        }
        if (
          event.clientY > splitHeight &&
          this.scrollSource !== "visualbrowser"
        ) {
          this.scrollSource = "visualbrowser";
        }
      }
    }),

    onBodyScroll: throttle(20, function(event) {
      // Throttle scroll to 60 FPS to optimise scrolling visual browser
      if (this.scrollSource == "list") {
        // Scrolled from tracklist
        // Calculate ratio
        let h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;
        let newScrollRatio =
          this.gridApi.gridBodyCon.eBodyViewport.scrollTop / h;
        // Apply ratio
        h = this.$refs.visualbrowser.$refs.hugeWrapper.clientHeight;
        this.$refs.visualbrowser.$refs.smallWrapper.scrollTop =
          newScrollRatio * h;
      }
      if (this.scrollSource == "visualbrowser") {
        // Scrolled from visual browser
        // Calculate ratio
        let h = this.$refs.visualbrowser.$refs.hugeWrapper.clientHeight;
        let newScrollRatio =
          this.$refs.visualbrowser.$refs.smallWrapper.scrollTop / h;
        // Apply ratio
        h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;
        this.gridApi.gridBodyCon.eBodyViewport.scrollTop = newScrollRatio * h;
      }
    }),
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
    onGridReady(params) {
      // console.log("set visibleTracks - onGridReady");
      this.gridApi = params.api;
      this.visibleTracks = this.gridApi.getRenderedNodes();
    },
    onGridSizeChanged(params) {
      // console.log("set visibleTracks - onGridSizeChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    onFilterChanged(params) {
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
    },
    onViewportChanged(params) {
      // console.log("set visibleTracks - onViewportChanged");
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
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
    },
    onCellEditingStopped(params) {
      if (params.newValue == params.oldValue) {
        this.$store.commit("setPreventScroll", false);
      }
    },
    onCellValueChanged(params) {
      this.$store.commit("setSaving", true);
      console.log("You'v edited a cell");

      let self = this;
      setTimeout(function() {
        self.save(params);
      }, 50);
    },
    save(params) {
      // > Save changes to Traktor XML
      let self = this;
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

      // >> Update Genres
      if (params.column.colId == "genre") {
        console.log("rebuild genre autocomplete");
        self.$store.commit("clearAllGenres");
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

      if (
        params.column.colId == "comment_1" ||
        params.column.colId == "comment_2"
      ) {
        console.log("rebuild tags autocomplete");
        self.$store.commit("clearTags");
        let collection = this.library["NML"]["COLLECTION"][0]["ENTRY"];
        collection.forEach(function(track, index) {
          let tags1 = track["INFO"][0]["$"]["COMMENT"];
          if (tags1 != undefined && tags1 != "") {
            tags1 = tags1.split(/[;,]+/).map((item) => item.trim());
          } else {
            tags1 = [];
          }
          let tags2 = track["INFO"][0]["$"]["RATING"];
          if (tags2 != undefined && tags2 != "") {
            tags2 = tags2.split(/[;,]+/).map((item) => item.trim());
          } else {
            tags2 = [];
          }
          let tags = [...tags1, ...tags2];

          if (tags.length > 0) {
            tags.forEach(function(tag, index) {
              if (
                self.$store.state.tags.indexOf(tag) < 0 &&
                tag != undefined &&
                tag != ""
              )
                self.$store.commit("addTag", tag);
            });
          }
        });
      }

      let updatedLibrary = JSON.parse(JSON.stringify(this.library));
      window.ipcRenderer.send("buildXML", [
        updatedLibrary,
        localStorage.pathToLibrary,
      ]);
    },

    pollTraktorOpen() {
      window.ipcRenderer.send("traktorOpen", "");
      this.traktorOpen = setInterval(() => {
        window.ipcRenderer.send("traktorOpen", "");
      }, 4000);
    },
  },
  created() {
    this.pollTraktorOpen();
  },
  mounted() {
    let self = this;

    if (localStorage.pathToLibrary) {
      this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
      console.log("Load library from localStorage: " + this.pathToLibrary);
    }

    window.ipcRenderer.receive("openLibrary", function(message) {
      localStorage.pathToLibrary = message;
      self.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      console.log("Selected library: " + message[0]);
      window.ipcRenderer.send("parseXML", message);
    });

    window.ipcRenderer.receive("buildXML", function(message) {
      console.log(message);
      self.$store.commit("setSaving", false);
      self.$store.commit("setPreventScroll", false);
    });

    window.ipcRenderer.receive("coverArtList", (message) => {
      // >> Create data from XML
      let collection = self.library["NML"]["COLLECTION"][0]["ENTRY"];
      let collectionFiltered = [];
      let filenameToIndex = {};

      collection.forEach(function(track, index) {
        let filename = track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");

        // >>> Autocomplete Genre
        let genre = track["INFO"][0]["$"]["GENRE"];
        if (
          self.$store.state.genres.indexOf(genre) < 0 &&
          genre != undefined &&
          genre != ""
        )
          self.$store.commit("addGenre", genre);

        // >>> Autocomplete Tags
        let tags1 = track["INFO"][0]["$"]["COMMENT"];
        if (tags1 != undefined && tags1 != "") {
          tags1 = tags1.split(/[;,]+/).map((item) => item.trim());
        } else {
          tags1 = [];
        }
        let tags2 = track["INFO"][0]["$"]["RATING"];
        if (tags2 != undefined && tags2 != "") {
          tags2 = tags2.split(/[;,]+/).map((item) => item.trim());
        } else {
          tags2 = [];
        }
        let tags = [...tags1, ...tags2];

        if (tags.length > 0) {
          tags.forEach(function(tag, index) {
            if (
              self.$store.state.tags.indexOf(tag) < 0 &&
              tag != undefined &&
              tag != ""
            )
              self.$store.commit("addTag", tag);
          });
        }

        // >>> Create Collection rowdata from XML
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

        // >>> Find tracks by Filename
        filenameToIndex[filename] = index;
      });
      this.$store.commit("setCollection", collectionFiltered);
      this.$store.commit("setRowData", collectionFiltered);
      this.$store.commit("setFilenameToIndex", filenameToIndex);

      // >> Create playlist data
      this.playlists = self.library["NML"]["PLAYLISTS"][0]["NODE"][0];

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
  beforeUnmount() {
    console.log("remove watcher and clear traktor check interval");
    clearInterval(this.traktorOpen);
    this.unsubscribe();
  },
};
</script>

<style lang="scss"></style>
