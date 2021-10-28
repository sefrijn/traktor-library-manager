<template>
	<div class="search mx-1.5 flex bg-black-medium">
		<input
			type="text"
			placeholder="Search"
			class="h-9 w-56 border-none bg-black-medium"
		/>
		<span class="h-9 w-9 block flex justify-center items-center">
			<svg-icon type="mdi" :path="iconSearch"></svg-icon>
		</span>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiMagnify } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconSearch: mdiMagnify,
		};
	},
};
</script>
