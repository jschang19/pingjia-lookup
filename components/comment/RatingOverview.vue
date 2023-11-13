<script setup lang="ts">
const props = defineProps({
	averageScore: {
		type: Number,
		required: true,
	},
	total: {
		type: Number,
		required: true,
	},
});

const isIntergal = computed(() => Number.isInteger(props.averageScore));
</script>

<template>
	<div>
		<p class="text-sm text-gray-400 dark:text-gray-400">{{ total }} 則評論</p>
		<p class="text-4xl font-bold">
			{{ isIntergal ? averageScore + ".0" : averageScore }}
		</p>
		<CommentStarRow :average-score="averageScore!" />
	</div>
</template>
