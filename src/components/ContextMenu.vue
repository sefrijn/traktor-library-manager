<template>
	<transition name="fade">
		<div
			v-if="contextMenu.show"
			@mouseenter="cancelHide"
			@mouseleave="hide"
			class="shadow-black block fixed z-30 bg-black-light p-2"
			:style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
		>
			<div
				class="shadow-black-lg absolute -top-1 -left-1 rounded-full w-2 h-2 bg-active-orange"
			></div>
			<ul class="text-sm">
				<li
					v-for="action in contextMenu.actions"
					class="px-2 py-0.5 hover:bg-active cursor-pointer"
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
