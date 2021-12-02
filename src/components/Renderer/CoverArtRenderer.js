export class CoverArtRenderer {
    init(params) {
        if (params.data.image) {
            this.eGui = document.createElement("img");
            this.eGui.src = "local-resource://coverart/60/" + params.data.image;
        }
    }

    getGui() {
        return this.eGui;
    }
}
