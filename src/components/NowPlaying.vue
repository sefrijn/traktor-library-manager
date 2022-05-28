<template>
    <div
        class="border-t border-black nowplaying text-sm font-medium text-center text-white bg-neutral-600 w-full"
    >
        <img v-if="image" :src="image" />
        <span
            v-if="artist"
            class="block uppercase text-xxs text-neutral-300 pt-2"
            >now playing</span
        >
        <p v-if="artist" class="pb-3 px-1">{{ artist }} - {{ title }}</p>
    </div>
</template>

<script>
export default {
    name: 'NowPlaying',
    computed: {
        artist() {
            return this.$store.state.trackPlaying.artist;
        },
        title() {
            return this.$store.state.trackPlaying.title;
        },
        image() {
            return this.$store.state.trackPlaying.image
                ? 'local-resource://coverart/400/' +
                      this.$store.state.trackPlaying.image
                : null;
        },
    },
};
</script>
