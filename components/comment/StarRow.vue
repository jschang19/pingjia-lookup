<script setup lang="ts">
defineProps({
	averageScore: {
		type: Number,
		required: true,
	},
});
</script>

<template>
	<div class="flex">
		<UIcon
			v-for="star in Math.round(averageScore)"
			:key="star"
			name="i-heroicons-star-solid"
			class="text-yellow-400 text-md"
		/>
		<UIcon
			v-for="star in 5 - Math.round(averageScore)"
			:key="star"
			name="i-heroicons-star"
			class="text-yellow-400 text-md"
		/>
	</div>
</template>
