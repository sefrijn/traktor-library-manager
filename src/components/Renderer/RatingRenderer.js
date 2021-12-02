export class RatingRenderer {
    init(params) {
        let val = parseInt(params.value);

        this.eGui = document.createElement("div");
        this.eGui.className = "rating flex";

        let stars_orange = "";
        for (var i = 1; i <= val; i++) {
            stars_orange += this.star("text-active-orange", i);
        }

        let stars_gray = "";
        for (var i = val + 1; i <= 5; i++) {
            stars_gray += this.star("text-white opacity-20", i);
        }

        this.eGui.innerHTML = stars_orange + stars_gray;
        this.eGui.addEventListener("click", this.saveCell.bind(event, params));
    }

    getGui() {
        return this.eGui;
    }

    star(color, i) {
        return `<span star="${i}" class="cursor-pointer">
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    class="pointer-events-none inline ${color}"
                    data-v-52a8d0d7=""
                    style="--sx:1; --sy:1; --r:0deg;"
                >
                    <path
                        d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
                        data-v-52a8d0d7=""
                    ></path></svg></span
            >`;
    }

    saveCell(params, e) {
        let newRating = e.path[0].getAttribute("star");
        params.setValue(newRating);
    }
}
