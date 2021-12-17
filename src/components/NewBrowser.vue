<template>
  <div class="overflow-auto">
    <ejs-treeview
      v-if="playlists.length > 0"
      ref="treeview"
      class="bg-white"
      id="treeview"
      :fields="fields"
      :allowDragAndDrop="true"
      :allowEditing="true"
      :enablePersistence="true"
      :dataSourceChanged="update"
      :nodeExpanded="update"
      :nodeCollapsed="update"
    ></ejs-treeview>
    <pre>{{ fields }}</pre>
  </div>
</template>
<script>
import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";
const cloneDeep = require("lodash.clonedeep");

var data = [];
export default {
  name: "App",
  components: {
    "ejs-treeview": TreeViewComponent,
  },
  data() {
    return {
      // fields: {
      //   dataSource: [],
      //   id: "nodeId",
      //   text: "nodeText",
      //   child: "nodeChild",
      // },
    };
  },
  computed: {
    playlists() {
      return this.$store.state.playlists;
    },
    fields() {
      var f = {};
      f.dataSource = this.playlists;
      f.id = "id";
      f.text = "text";
      return f;
    },
  },
  methods: {
    removeItem() {
      // this.content[0].nodeText = "hahahahahaha";
      // console.log(this.content);
      // let d = this.$refs.treeview.getTreeData();
      // console.log(d);
      // this.fields = {
      //   dataSource: this.content,
      //   id: "nodeId",
      //   text: "nodeText",
      //   child: "nodeChild",
      // };
    },
    update: function(args) {
      // Set store playlist object to match TreeData
      console.log("update");
      console.log(args);
      let d = this.$refs.treeview.getTreeData();
      console.log(d);
    },
  },
  mounted() {
    // this.fields = {
    //   dataSource: this.playlists,
    //   id: "id",
    //   text: "text",
    //   // child: "nodeChild",
    // };
    // setTimeout(() => {
    //   this.removeItem();
    // }, 5000);
  },
};
</script>
<style>
@import "./../../node_modules/@syncfusion/ej2-base/styles/material.css";
@import "./../../node_modules/@syncfusion/ej2-vue-navigations/styles/material.css";
@import "./../../node_modules/@syncfusion/ej2-inputs/styles/material.css";
@import "./../../node_modules/@syncfusion/ej2-buttons/styles/material.css";
.control_wrapper {
  display: block;
  max-width: 350px;
  max-height: 350px;
  margin: auto;
  overflow: auto;
  border: 1px solid #dddddd;
  border-radius: 3px;
}
</style>
