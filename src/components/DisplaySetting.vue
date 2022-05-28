<template>
    <div class="flex space-x-0.5 items-center h-9">
        <div>
            <input
                id="viewlist"
                v-model="display"
                type="radio"
                name="display"
                value="list"
            />
            <label v-tooltip="'List view'" for="viewlist">
                <svg-icon type="mdi" :path="iconList" size="22"></svg-icon
            ></label>
        </div>
        <div>
            <input
                id="viewsplit"
                v-model="display"
                type="radio"
                name="display"
                value="split"
            />
            <label v-tooltip="'Split view'" for="viewsplit"
                ><svg-icon type="mdi" :path="iconSplit" size="22"></svg-icon
            ></label>
        </div>
        <div>
            <input
                id="viewgrid"
                v-model="display"
                type="radio"
                name="display"
                value="visualbrowser"
            />
            <label v-tooltip="'Coverview'" for="viewgrid"
                ><svg-icon type="mdi" :path="iconGrid" size="22"></svg-icon
            ></label>
        </div>
    </div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiViewHeadline } from '@mdi/js';
import { mdiViewSplitHorizontal } from '@mdi/js';
import { mdiViewComfy } from '@mdi/js';

export default {
    components: {
        SvgIcon,
    },
    data() {
        return {
            iconList: mdiViewHeadline,
            iconSplit: mdiViewSplitHorizontal,
            iconGrid: mdiViewComfy,
        };
    },
    computed: {
        display: {
            get() {
                return this.$store.getters.display;
            },
            set(value) {
                this.$store.commit('setDisplay', value);
            },
        },
    },
};
</script>

<style scoped>
input[type='radio'] {
    @apply hidden;
}
input[type='radio'] + label:hover {
    @apply cursor-pointer;
}

label {
    @apply flex justify-center items-center h-9 w-9;
}
</style>
