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
            class="flex items-center justify-center cursor-pointer color-dot"
            :class="{ 'active-color': color == index }"
        >
            <div
                class="h-3 w-3 rounded-full shadow ring-white ring-opacity-50"
                :class="[`color-${index}`, { 'ring-4': color == index }]"
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
            this.params.setValue(this.color);
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
