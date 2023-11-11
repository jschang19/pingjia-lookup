<script setup lang="ts">
interface comment {
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
	comment: {
		type: Object as PropType<comment>,
		required: true,
	},
});
const tooLong = ref(prop.comment.content.length > 100);
const displayMore = ref(false);
</script>

<template>
	<div>
		<div class="flex flex-col gap-2 pt-1 pb-8 dark:border-slate-700">
			<p class="text-sm font-semibold text-black dark:text-gray-100">{{ prop.comment.author }}</p>
			<div class="flex flex-row">
				<UIcon
					v-for="star in prop.comment.scores.average"
					:key="star"
					name="i-heroicons-star-solid"
					class="text-yellow-400"
				/>
			</div>
			<p class="text-sm break-words leading-6 text-gray-700 dark:text-gray-400">
				{{
					tooLong
						? !displayMore
							? prop.comment.content.slice(0, 100) + " ..."
							: prop.comment.content
						: prop.comment.content
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
			<p class="text-xs text-gray-400 dark:text-gray-600">評價日期：{{ prop.comment.createdAt }}</p>
		</div>
	</div>
</template>
