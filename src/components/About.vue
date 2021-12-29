<template>
  <div
    class="h-8 bg-yellow-200 text-black flex-shrink-0 text-xs font-semibold tracking-wider px-2 flex items-center justify-center relative space-x-6"
  >
    <p>
      Free beta version by
      <span
        class="underline text-black font-extrabold cursor-pointer hover:text-black-light"
        @click="openURL('https://mixcloud.com/sefrijn')"
        >DJ Sefrijn</span
      >
      from studio
      <span
        class="underline text-black font-extrabold cursor-pointer hover:text-black-light"
        @click="openURL('https://howaboutyes.com')"
        >How About Yes</span
      >.
    </p>
    <p>Enjoy my work?</p>
    <button
      class="rounded font-bold tracking-wider bg-indigo-800 hover:bg-indigo-600 text-white px-2.5 py-1"
      @click="openURL('https://ko-fi.com/sefrijn')"
    >
      <svg-icon
        type="mdi"
        class="inline-block text-white mr-1"
        :path="iconCoffee"
        size="15"
      ></svg-icon>

      Buy me a coffee
    </button>
  </div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiCoffeeOutline } from "@mdi/js";

export default {
  components: {
    SvgIcon,
  },
  data() {
    return {
      iconCoffee: mdiCoffeeOutline,
    };
  },
  methods: {
    openURL(url) {
      window.ipcRenderer.send("openURL", url);
    },
  },
};
</script>
