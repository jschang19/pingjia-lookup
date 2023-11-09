<script setup lang="ts">
interface Review {
	id: string;
	shopId: string;
	author: string;
	rating: number;
	comment: string;
}

const props = defineProps({
	review: {
		type: Object as PropType<Review>,
		required: true,
	},
});
</script>

<template>
	<UCard class="w-full">
		<div class="flex flex-col gap-2">
			<p>{{ props.review.author }}</p>
			<div class="flex flex-row gap-3 justify-start text-sm">
				<p>食物評價</p>
				<p>環境評價</p>
				<p>服務評價</p>
			</div>
		</div>
	</UCard>
</template>
