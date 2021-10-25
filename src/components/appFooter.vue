<template>
	<footer class="text-xs text-gray font-mono">
		<span>Currently editing: {{ path }}</span>
	</footer>
</template>

<script>
export default {
	props: ["path"],
	data() {
		return {};
	},
	methods: {},
};
</script>
