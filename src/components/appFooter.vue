<template>
	<footer class="px-4 flex justify-between font-medium text-xs text-gray">
		<span>Currently editing: {{ path }}</span>
		<span>{{ total }} songs</span>
	</footer>
</template>

<script>
export default {
	props: ["path", "total"],
	data() {
		return {};
	},
	methods: {},
};
</script>
