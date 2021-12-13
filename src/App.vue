<template>
  <div
    class="h-screen bg-black-dark text-white font-sans"
    @click="hideContextMenu"
  >
    <app-header ref="header" style="height:67px;"></app-header>

    <main class="flex relative" @mouseup="endDragging">
      <welcome style="height: calc(100vh - 134px);"> </welcome>

      <generate-cover-art style="height: calc(100vh - 134px);">
      </generate-cover-art>

      <aside
        v-if="sidebar && pathToLibrary"
        class="max-w-sm flex flex-col justify-between border-r border-black"
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
        class="flex-grow relative border-l border-black"
        style="height: calc(100vh - 134px);"
        @wheel="setScrollSource"
      >
        <context-menu></context-menu>
        <ag-grid-vue
          ref="trackList"
          class="ag-theme-alpine-dark w-full"
          :class="classesGrid"
          :rowBuffer="10"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          :suppress-scroll-on-new-data="preventScroll"
          :row-data="rowData"
          :row-class-rules="rowClassRules"
          :grid-options="gridOptions"
          :rowDragManaged="true"
          :rowDragMultiRow="false"
          :animateRows="true"
          :rowSelection="`multiple`"
          @grid-ready="onGridReady"
          @viewport-changed="onViewportChanged"
          @cell-value-changed="onCellValueChanged"
          @cell-editing-started="onCellEditingStarted"
          @cell-editing-stopped="onCellEditingStopped"
          @cell-clicked="onCellClicked"
          @cell-context-menu="onCellContextMenu"
          @body-scroll="onBodyScroll"
          @grid-size-changed="onGridSizeChanged"
          @filter-changed="onFilterChanged"
          @row-drag-end="onRowDragEnd"
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
import ContextMenu from "./components/ContextMenu.vue";

// Split App.vue into separate files
import appBeforeMount from "./mixins/AppBeforeMount.js";
import appMounted from "./mixins/AppMounted.js";
import appMethods from "./mixins/AppMethods.js";
import fancyTimeFormat from "./mixins/FancyTimeFormat.js";

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
    ContextMenu,
  },
  mixins: [fancyTimeFormat, appBeforeMount, appMounted, appMethods],
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
      visibleTracks: [],
      asideWidth: 20, // Number - percentage
      rowClassRules: null, // styling of rows
      playlists: null,
      unsubscribe: null,
      traktorOpen: null, // Boolean
      scrollSource: null,
      // contextMenu: { x: 0, y: 0, show: false },
    };
  },
  computed: {
    activePlaylist() {
      return this.$store.getters.activePlaylist;
    },
    activePlaylistPath() {
      return this.$store.getters.activePlaylistPath;
    },
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
    contextMenu() {
      return this.$store.getters.contextMenu;
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
    coverSize() {
      return this.$store.getters.coverSize;
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
    coverSize(newCoverSize, oldCoverSize) {
      let self = this;
      if (newCoverSize != oldCoverSize) {
        console.log(
          "update scroll position of visual browser: " + newCoverSize
        );
        this.scrollSource = "coverSize";
        setTimeout(function() {
          self.onBodyScroll();
        }, 20);
      }
    },
  },
  beforeUnmount() {
    console.log("remove watcher and clear traktor check interval");
    clearInterval(this.traktorOpen);
    this.unsubscribe();
  },
};
</script>
