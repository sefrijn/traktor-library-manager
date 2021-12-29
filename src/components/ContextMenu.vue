<template>
	<transition name="fade">
		<div
			v-if="contextMenu.show"
			@mouseenter="cancelHide"
			@mouseleave="hide"
			class="shadow-black rounded ring-4 ring-black ring-opacity-50 block fixed z-30 bg-indigo-900 p-2"
			style="min-width:150px;"
			:style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
		>
			<ul class="text-sm">
				<li
					v-for="action in contextMenu.actions"
					class="px-2 py-0.5 hover:bg-indigo-700 cursor-pointer"
					@click="
						$store.commit(contextMenu.source + action, contextMenu)
					"
				>
					{{ action }}
				</li>
			</ul>
		</div>
	</transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>

<script>
export default {
	data() {
		return {
			timer: null,
		};
	},
	computed: {
		contextMenu() {
			return this.$store.getters.contextMenu;
		},
	},
	methods: {
		hide() {
			this.timer = setTimeout(() => {
				let val = this.contextMenu;
				if (val.show) {
					val.show = false;
					this.$store.commit("setContextMenu", val);
				}
			}, 800);
		},
		cancelHide() {
			clearTimeout(this.timer);
		},
	},
	beforeUnmount() {
		clearTimeout(this.timer);
	},
};
</script>
