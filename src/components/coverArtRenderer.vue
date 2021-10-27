<template>
    <img :src="file" />
</template>

<script>
export default {
    data() {
        return {
            file: "",
            cell: "",
            rowIndex: "",
        };
    },
    beforeMount() {
        let self = this;

        this.cell = this.params.column.colId + this.params.rowIndex;
        this.rowIndex = this.params.rowIndex;
        let file = this.params.value;
        // console.log(this.params);

        window.ipcRenderer.send("coverArtList", [
            file,
            this.cell,
            JSON.parse(JSON.stringify(this.params.data)),
            this.rowIndex,
            // this.params.data,
        ]);

        window.ipcRenderer.receive("coverArtList", function(picture) {
            if (self.cell == picture[1]) {
                self.file = picture[0];
            }
        });
    },
};
</script>
