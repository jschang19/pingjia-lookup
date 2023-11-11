<script setup lang="ts">
interface ratingCounts {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
}
type RatingCountKeys = keyof ratingCounts;

const props = defineProps({
	ratingCounts: {
		type: Object as PropType<ratingCounts>,
		required: true,
	},
	total: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div class="flex flex-col-reverse gap-1 w-full">
		<div class="flex items-center gap-1" v-for="index in 5" :key="index">
			<span class="text-xs text-gray-400 dark:text-gray-400">{{ index }}</span>
			<UProgress :value="ratingCounts[index as RatingCountKeys]" :max="total" />
			<span class="text-xs text-gray-300 dark:text-gray-400">{{ ratingCounts[index as RatingCountKeys] }}</span>
		</div>
	</div>
</template>
