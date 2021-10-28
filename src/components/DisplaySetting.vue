<template>
	<div class="flex mx-1 items-center h-9">
		<div>
			<input
				type="radio"
				name="display"
				value="list"
				id="viewlist"
				v-model="display"
			/>
			<label for="viewlist" v-tooltip="'Show collection as list'">
				<svg-icon type="mdi" :path="iconList" size="22"></svg-icon
			></label>
		</div>
		<div>
			<input
				type="radio"
				name="display"
				value="split"
				id="viewsplit"
				v-model="display"
				checked
			/>
			<label for="viewsplit" v-tooltip="'Split list and coverview'"
				><svg-icon type="mdi" :path="iconSplit" size="22"></svg-icon
			></label>
		</div>
		<div>
			<input
				type="radio"
				name="display"
				value="grid"
				id="viewgrid"
				v-model="display"
			/>
			<label for="viewgrid" v-tooltip="'Show only coverview'"
				><svg-icon type="mdi" :path="iconGrid" size="22"></svg-icon
			></label>
		</div>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiViewHeadline } from "@mdi/js";
import { mdiViewSplitHorizontal } from "@mdi/js";
import { mdiViewComfy } from "@mdi/js";

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
		loading() {
			return this.$store.state.loading;
		},
		display: {
			get() {
				return this.$store.state.display;
			},
			set(value) {
				this.$store.commit("setDisplay", value);
			},
		},
	},
};
</script>

<style scoped>
input[type="radio"] {
	@apply hidden;
}
input[type="radio"] + label {
	@apply mx-0.5 bg-black-medium;
}
input[type="radio"] + label:hover {
	@apply bg-black-dark cursor-pointer;
}

label {
	@apply flex justify-center items-center h-9 w-9;
}
input[type="radio"]:checked + label {
	/*background-color: red;*/
	@apply bg-active;
}
</style>
