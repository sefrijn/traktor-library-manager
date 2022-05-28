<template>
    <div class="search relative flex bg-neutral-700">
        <p
            v-if="text"
            class="absolute bottom-full uppercase w-full py-0 font-medium text-neutral-400 text-xxs"
        >
            Search for
        </p>

        <input
            ref="input"
            v-model="text"
            type="text"
            placeholder="Search"
            class="h-9 w-48 border-none bg-neutral-700 hover:bg-neutral-800 focus:outline-none focus:ring-0 focus:bg-neutral-800"
            @input="searching($event)"
        />
        <button
            v-if="query"
            v-tooltip="'Clear'"
            class="h-9 w-9 block flex justify-center items-center cursor-pointer hover:bg-neutral-800"
            @click="clear"
        >
            <svg-icon type="mdi" :path="iconClear"></svg-icon>
        </button>

        <button
            v-if="!query"
            class="h-9 w-9 block flex justify-center items-center"
            @click="focusInput"
        >
            <svg-icon v-if="!query" type="mdi" :path="iconSearch"></svg-icon>
        </button>
    </div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMagnify } from '@mdi/js';
import { mdiClose } from '@mdi/js';

export default {
    components: {
        SvgIcon,
    },
    data() {
        return {
            iconSearch: mdiMagnify,
            iconClear: mdiClose,
            text: '',
        };
    },
    computed: {
        query() {
            return this.$store.state.query;
        },
    },
    methods: {
        focusInput() {
            this.$refs.input.focus();
        },
        searching(event) {
            this.$store.commit('setQuery', this.text);
        },
        clear() {
            this.text = '';
            this.$store.commit('setQuery', '');
        },
    },
};
</script>
