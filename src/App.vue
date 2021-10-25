<template>
  <div class="h-screen bg-black-dark text-white font-sans">
    <app-header
      style="height:100px;"
      @load="load"
      v-on:show-genres="showGenres"
    ></app-header>

    <ag-grid-vue
      #trackList
      style="height: calc(100vh - 150px);"
      class="ag-theme-alpine-dark w-full"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      :gridOptions="gridOptions"
      @grid-ready="onGridReady"
      @viewport-changed="onViewportChanged"
      @cell-value-changed="onCellValueChanged"
      @cell-clicked="onCellClicked"
    >
    </ag-grid-vue>

    <app-footer
      style="height: 50px;"
      class="flex justify-center items-center"
      :path="pathToLibrary"
    >
    </app-footer>
  </div>
</template>

<script>
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import { AgGridVue } from "ag-grid-vue3";
import { reactive, onMounted } from "vue";
import appHeader from "./components/appHeader.vue";
import appFooter from "./components/appFooter.vue";
import CoverArtRenderer from "./components/coverArtRenderer.vue";
import track_fields from "./components/columnHeaders.js";
import { column_defs } from "./components/columnDefs.js";

export default {
  name: "App",
  data() {
    return {
      pathToLibrary: "",
      columnDefs: null,
      rowData: null,
      gridApi: null,
      columnApi: null,
      gridOptions: null,
      library: null,
      genres: [],
      defaultColDef: {
        editable: true,
      },
      track_fields: track_fields,
    };
  },
  components: {
    AgGridVue,
    CoverArtRenderer,
    appHeader,
    appFooter,
  },
  beforeMount() {
    this.gridOptions = {};
    this.columnDefs = column_defs;
  },

  methods: {
    load(event) {
      window.ipcRenderer.send("toMain", 10);
    },
    showGenres() {
      console.log("test");
    },
    updateRowData(data) {
      this.rowData = data;
    },
    onGridReady(params) {
      console.log("Grid ready!");
    },
    onViewportChanged(params) {
      // console.log(this.pathToLibrary);
    },
    onCellClicked(params) {
      if (params.colDef.field == this.track_fields[16]) {
        console.log("play audio");
        window.ipcRenderer.send("readAudio", params.data.filename);
      }
    },
    onCellValueChanged(params) {
      // console.log("You'v edited a cell");
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

    // window.ipcRenderer.removeAllListeners([
    //   "fromMain",
    //   "sendJSobject",
    //   "savedXML",
    //   "showID3",
    //   "sendAudioBlob",
    // ]);

    if (localStorage.pathToLibrary) {
      this.pathToLibrary = localStorage.pathToLibrary;
      console.log(localStorage.pathToLibrary);
      window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
    }

    window.ipcRenderer.receive("fromMain", function(message) {
      localStorage.pathToLibrary = message;
      self.pathToLibrary = message;
      console.log(message);
      window.ipcRenderer.send("parseXML", message);
    });

    window.ipcRenderer.receive("savedXML", function(message) {
      console.log(message);
    });

    window.ipcRenderer.receive("sendJSobject", (message) => {
      console.log(message);
      self.library = message;
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
          [self.track_fields[15]]:
            track["LOCATION"][0]["$"]["DIR"].replace(/:/g, "") +
            track["LOCATION"][0]["$"]["FILE"],
        };
      });
      self.updateRowData(collectionFiltered);
    });
  },
};
</script>

<style lang="scss"></style>
