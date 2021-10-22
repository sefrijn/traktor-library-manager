<template>
  <h1 class="text-red-500">Traktor Library Manager</h1>
  <button class="bg-gray-100 px-5 py-2 hover:bg-gray-200" @click="load">
    Load
  </button>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      pathToLibrary: "",
    };
  },
  methods: {
    load(event) {
      window.ipcRenderer.send("toMain", 10);
    },
  },
  mounted() {
    if (localStorage.pathToLibrary) {
      this.pathToLibrary = localStorage.pathToLibrary;
    }
    window.ipcRenderer.receive("fromMain", function(message) {
      console.log(message);
      localStorage.pathToLibrary = message;
    });
  },
  watch: {
    pathToLibrary(newPath) {
      localStorage.pathToLibrary = newPath;
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
