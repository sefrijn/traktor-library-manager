<template>
    <div
        class="wrapper h-full w-full flex justify-center items-center bg-transparent hover:bg-active"
    >
        <span class="index" v-if="!hover">{{ value }}</span>
        <svg-icon class="icon" type="mdi" :path="iconPlayPause"></svg-icon>
    </div>
</template>

<style lang="scss">
.wrapper {
    .icon {
        display: none;
    }
}
.wrapper:hover {
    .icon {
        display: block;
    }
    .index {
        display: none;
    }
}
</style>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiPlay } from "@mdi/js";

export default {
    components: {
        SvgIcon,
    },
    data() {
        return {
            hover: false,
            value: "",
            iconPlayPause: mdiPlay,
        };
    },
    beforeMount() {
        this.value = this.params.value;
    },
};
</script>
