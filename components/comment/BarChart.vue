<script setup lang="ts">
interface RatingCounts {
	0: number;
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
}
type RatingCountKeys = keyof RatingCounts;

defineProps({
	ratingCounts: {
		type: Object as PropType<RatingCounts>,
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
		<div v-for="index in 5" :key="index" class="flex items-center gap-1">
			<span class="text-xs text-gray-400 dark:text-gray-400">{{ index }}</span>
			<UProgress :value="Number(ratingCounts[index as RatingCountKeys])" :max="total" />
			<span class="text-xs text-gray-300 dark:text-gray-400">{{ ratingCounts[index as RatingCountKeys] }}</span>
		</div>
	</div>
</template>
