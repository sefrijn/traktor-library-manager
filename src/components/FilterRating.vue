<template>
    <div class="flex h-9 bg-neutral-700 pl-2 items-center relative">
        <p
            v-if="rating > 0"
            class="absolute filter-label left-0 bottom-full uppercase w-full font-medium text-neutral-400 text-xxs whitespace-nowrap overflow-hidden overflow-ellipsis"
        >
            filter by intensity
        </p>

        <div class="rating flex items-center">
            <span
                v-for="star in rating"
                :star="star"
                class="-mt-0.5 cursor-pointer"
                @click="filter"
            >
                <svg-icon
                    class="pointer-events-none inline text-secondary-500"
                    type="mdi"
                    :path="iconStar"
                    size="17"
                ></svg-icon>
            </span>
            <span
                v-for="star in 5 - rating"
                :star="star + rating"
                class="-mt-0.5 cursor-pointer"
                @click="filter"
            >
                <svg-icon
                    class="pointer-events-none inline text-white opacity-20"
                    type="mdi"
                    :path="iconStar"
                    size="17"
                ></svg-icon>
            </span>
        </div>

        <button
            v-tooltip="'Clear'"
            :star="0"
            class="h-9 w-9 ml-1 block flex justify-center items-center cursor-pointer hover:bg-neutral-800"
            :class="{ 'pointer-events-none': rating == 0 }"
            @click="filter"
        >
            <svg-icon
                class="pointer-events-none"
                :class="{ 'text-neutral-600': rating == 0 }"
                type="mdi"
                :path="iconCancel"
            ></svg-icon>
        </button>
    </div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiStar } from '@mdi/js';
import { mdiClose } from '@mdi/js';

export default {
    components: {
        SvgIcon,
    },
    data() {
        return {
            iconStar: mdiStar,
            iconCancel: mdiClose,
        };
    },
    computed: {
        rating() {
            return this.$store.state.filter.rating;
        },
    },
    methods: {
        filter(e) {
            let value = {};
            value.rating = parseInt(e.target.attributes.star.nodeValue);
            value.color = this.$store.state.filter.color;
            this.$store.commit('setFilter', value);
        },
    },
};
</script>

<style>
div:hover > .filter-label {
    display: block;
}
</style>
