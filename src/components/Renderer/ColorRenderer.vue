<template>
    <div
        class="flex h-full space-x-1"
        @mouseleave="resetColor"
        @click="saveCell"
    >
        <div
            v-for="index in 7"
            @mouseenter="setColor"
            :color="index"
            class="flex cursor-pointer items-center justify-center color-dot"
            :class="{ 'active-color': color == index }"
        >
            <div
                class="h-2 w-2 rounded-full transition-transform"
                :class="[
                    `color-${index}`,
                    { 'transform scale-125 shadow-black': color == index },
                ]"
            ></div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            color: "",
        };
    },
    beforeMount() {
        this.color = this.params.value;
    },
    methods: {
        saveCell() {
            // prevent scrolling and set value
            this.$store.dispatch("setPreventScroll", true).then(() => {
                this.params.setValue(this.color);
                let rowNode = this.params.api.getRowNode(
                    this.params.data.index
                );
                this.params.api.redrawRows({
                    rowNodes: [rowNode],
                });
            });
        },
        setColor(e) {
            this.color = parseInt(e.target.attributes.color.nodeValue);
        },
        resetColor() {
            this.color = this.params.value;
        },
    },
};
</script>

<style scoped></style>
