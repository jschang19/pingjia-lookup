<script setup lang="ts">
interface Review {
	id: string;
	content: string;
	author: string;
	shopId: string;
	averagePrice: number;
	scores: {
		taste: number;
		environment: number;
		service: number;
		average: number;
	};
	createdAt: string;
}

const prop = defineProps({
	review: {
		type: Object as PropType<Review>,
		required: true,
	},
});
const tooLong = ref(prop.review.content.length > 100);
const displayMore = ref(false);
</script>

<template>
	<div>
		<div class="flex flex-col gap-2 pt-1 pb-3 border-b dark:border-slate-700">
			<p class="text-sm text-gray-700 dark:text-gray-400">{{ prop.review.author }}</p>
			<div class="flex flex-row">
				<UIcon
					v-for="star in prop.review.scores.average"
					:key="star"
					name="i-heroicons-star-solid"
					class="text-yellow-400"
				/>
			</div>
			<p class="text-sm break-words leading-6 text-gray-700 dark:text-gray-400">
				{{
					tooLong
						? !displayMore
							? prop.review.content.slice(0, 100) + " ..."
							: prop.review.content
						: prop.review.content
				}}
				<span
					class="underline underline-offset-2 dark:text-gray-300"
					v-if="tooLong && !displayMore"
					@click="displayMore = true"
					>顯示更多</span
				>
			</p>
			<p
				class="text-sm underline underline-offset-2dark:text-gray-300"
				v-if="tooLong && displayMore"
				@click="displayMore = false"
			>
				隱藏
			</p>
			<p class="text-sm text-gray-700 dark:text-gray-400">評價日期：{{ prop.review.createdAt }}</p>
		</div>
	</div>
</template>
