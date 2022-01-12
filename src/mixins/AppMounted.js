const cloneDeep = require("lodash.clonedeep");
import { nmlCollection, nmlPlaylist } from "./../config/paths.js";

export default {
  mounted() {
    // App has started before, first check version
    window.ipcRenderer.send("setVersion", "");

    window.ipcRenderer.receive("setVersion", (version) => {
      console.log(
        "Version opened before: " +
          localStorage.version +
          ", Newest version: " +
          version
      );
      if (localStorage.version == version && localStorage.pathToLibrary) {
        console.log("Same version, load the library...");
        this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
        window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
        console.log("Library Path: " + this.pathToLibrary);
      }
      localStorage.version = version;
    });

    window.ipcRenderer.receive("openLibrary", (message) => {
      localStorage.pathToLibrary = message;
      this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      console.log("Selected library: " + message[0]);
      window.ipcRenderer.send("parseXML", message);
    });

    window.ipcRenderer.receive("buildXML", (message) => {
      // Saving XML to disk finished
      this.$store.commit("setSaving", false);
      this.$store.commit("setPreventScroll", false);
    });

    window.ipcRenderer.receive("coverArtList", (message) => {
      // >> Create data from XML
      let collection = this.$store.getters.library(nmlCollection);
      let collectionFiltered = [];
      let filenameToIndex = {};

      collection.forEach((track, index) => {
        let filename = track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":");

        // >>> Autocomplete Genre
        let genre = track["INFO"][0]["$"]["GENRE"];
        if (genre) genre = caps(genre);
        if (
          this.$store.getters.genres.indexOf(genre) < 0 &&
          genre != undefined &&
          genre != ""
        )
          this.$store.commit("addGenre", genre);

        // >>> Autocomplete Tags
        let tags1 = track["INFO"][0]["$"]["COMMENT"];
        if (tags1) tags1 = caps(tags1);
        let tags1_str = tags1;
        if (tags1 != undefined && tags1 != "") {
          tags1 = tags1.split(/[;,]+/).map((item) => caps(item.trim()));
        } else {
          tags1 = [];
        }

        let tags2 = track["INFO"][0]["$"]["RATING"];
        if (tags2) tags2 = caps(tags2);
        let tags2_str = tags2;
        if (tags2 != undefined && tags2 != "") {
          tags2 = tags2.split(/[;,]+/).map((item) => caps(item.trim()));
        } else {
          tags2 = [];
        }
        let tags = [...tags1, ...tags2];

        if (tags.length > 0) {
          tags.forEach((tag, index) => {
            if (
              this.$store.getters.tags.indexOf(tag) < 0 &&
              tag != undefined &&
              tag != ""
            )
              this.$store.commit("addTag", tag);
          });
        }

        // >>> Create Collection rowdata from XML
        collectionFiltered[index] = {
          ["index"]: index,
          ["artist"]: track["$"]["ARTIST"],
          ["title"]: track["$"]["TITLE"],
          ["length"]: this.fancyTimeFormat(
            track["INFO"][0]["$"]["PLAYTIME"],
            true
          ),
          ["genre"]: genre,
          ["comment_1"]: tags1_str,
          ["comment_2"]: tags2_str,
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
          ["play_count"]: track["INFO"][0]["$"]["PLAYCOUNT"],
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
      this.totalSongs = Object.keys(collectionFiltered).length;

      this.$store.commit("setCollection", collectionFiltered);
      this.$store.commit("setRowData", collectionFiltered);
      this.$store.commit("setFilenameToIndex", filenameToIndex);

      // >> Create playlist data & Delete old autoplaylists
      this.$store.commit("initialPlaylistData");

      // >> Autoplaylist Root Folder
      this.$store.commit("setAutoplaylistFolder");
      // >> Create new autoplaylist data
      this.$store.commit("setDateImportedList");
      this.$store.commit("setTagList");
      this.$store.commit("setGenreList");

      // Write autoplaylist data to this.library and XML file
      this.$store.commit("setLibraryPlaylist");

      let libraryObj = cloneDeep(this.$store.getters.libraryFull);
      window.ipcRenderer.send("buildXML", [
        libraryObj,
        localStorage.pathToLibrary,
        "Autoplaylist Data update in Library Manager",
      ]);

      if (this.$store.getters.startingUp) {
        this.$store.commit("setStartingUp", false);
      }
    });

    window.ipcRenderer.receive("parseXML", (xmlAsJS) => {
      this.$store.commit("setLibrary", xmlAsJS);

      let collection = this.$store.getters.library(nmlCollection);
      let paths = {};
      collection.forEach((track, index) => {
        paths[index] = {
          path: track["LOCATION"][0]["$"]["DIR"].replace(/:/g, ""),
          file: track["LOCATION"][0]["$"]["FILE"].replace(/\/\//g, ":"),
        };
      });
      window.ipcRenderer.send("coverArtList", cloneDeep(paths));
    });

    window.ipcRenderer.receive("logError", (message) => {
      console.error(message);
    });
  },
};

function caps(txt) {
  return txt
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(" ");
}
