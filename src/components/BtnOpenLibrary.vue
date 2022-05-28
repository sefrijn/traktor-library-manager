<template>
    <!-- Welcome button -->
    <button
        v-if="!tooltip"
        class="bg-primary-500 text-white font-bold tracking-wider flex justify-center items-center h-12"
        @click="load"
    >
        <div class="flex justify-center w-12">
            <svg-icon type="mdi" :path="iconOpenLib" :size="size"></svg-icon>
        </div>
        <p v-if="text" class="mr-4">{{ text }}</p>
    </button>

    <!-- Header button -->
    <button
        v-if="tooltip"
        v-tooltip="'Open Traktor Library NML File'"
        class="flex justify-center items-center h-9"
        @click="load"
    >
        <div class="flex justify-center w-9">
            <svg-icon type="mdi" :path="iconOpenLib" :size="size"></svg-icon>
        </div>
        <p v-if="text" class="mr-4">{{ text }}</p>
    </button>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiArchiveSearch } from '@mdi/js';

export default {
    components: {
        SvgIcon,
    },
    props: {
        size: {
            type: Number,
            default: 18,
        },
        text: {
            type: String,
            default: '',
        },
        tooltip: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            iconOpenLib: mdiArchiveSearch,
        };
    },
    methods: {
        load(event) {
            window.ipcRenderer.send('openLibrary', 'trigger open file');
        },
    },
};
</script>
