export default {
  mounted() {
    if (localStorage.pathToLibrary) {
      this.$store.commit("setLibraryPath", localStorage.pathToLibrary);
      window.ipcRenderer.send("parseXML", [this.pathToLibrary]);
      console.log("Load library from localStorage: " + this.pathToLibrary);
    }

    let self = this;

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
      console.log(self.library);

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
