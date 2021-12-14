import { column_defs, ag_components } from "./../config/columnDefs.js";
import tinykeys from "tinykeys";

export default {
  beforeMount() {
    this.pollTraktorOpen();

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
      Escape: () => {
        this.contextMenu.show = false;
      },
    });
  },
};
