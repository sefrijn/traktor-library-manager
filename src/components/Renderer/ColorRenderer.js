import store from "../../store";

export class ColorRenderer {
    init(params) {
        this.eGui = document.createElement("div");
        this.eGui.className = "flex h-full space-x-1";
        let dots = "";
        for (var i = 1; i <= 7; i++) {
            dots += this.star(params.value, i);
        }

        this.eGui.addEventListener("click", this.saveCell.bind(event, params));
        this.eGui.innerHTML = dots;
    }

    getGui() {
        return this.eGui;
    }

    star(current, i) {
        let active = "";
        let current_class = "";
        if (i == current) {
            active = "active-color";
            current_class = "transform scale-150 shadow-black";
        }
        return `
            <div
                color="${i}"
                class="flex cursor-pointer items-center justify-center color-dot ${active}"
            >
                <div class="pointer-events-none h-2 w-2 rounded-full transition-transform color-${i} ${current_class}">
               </div>
        </div>`;
    }

    saveCell(params, e) {
        if (store.getters.savingEnabled) {
            console.log("set color to " + e.path[0].getAttribute("color"));
            let newColor = e.path[0].getAttribute("color");
            params.setValue(newColor);
            let rowNode = params.api.getRowNode(params.data.index);
            params.api.redrawRows({
                rowNodes: [rowNode],
            });
        } else {
            console.log("saving disabled");
        }
    }
}
