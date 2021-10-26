<template>
    <img :src="file" />
</template>

<script>
export default {
    data() {
        return {
            file: "",
            cell: "",
        };
    },
    beforeMount() {
        let self = this;

        this.cell = this.params.column.colId + this.params.rowIndex;
        let file = this.params.value;

        window.ipcRenderer.send("readID3", [file, this.cell]);

        window.ipcRenderer.receive("showCoverArt", function(picture) {
            if (self.cell == picture[1]) {
                self.file = picture[0];
            }
        });
    },
};
</script>
