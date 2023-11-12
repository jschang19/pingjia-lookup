<script setup lang="ts">
interface Shop {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
	averageScore: number;
	cityName: string;
	address: string;
}

const props = defineProps({
	shop: {
		type: Object as PropType<Shop>,
		required: true,
	},
});

const commentUrl = computed(() => `/comment/${props.shop.id}`);
</script>

<template>
	<div>
		<NuxtLink :to="commentUrl">
			<div class="w-full py-4">
				<div class="flex flex-col gap-2">
					<div class="flex flex-row gap-3">
						<h6 class="text-md font-bold self-center">{{ props.shop.name }}</h6>
						<span class="text-sm self-center text-gray-500 dark:text-gray-400">{{ props.shop.branch }}</span>
					</div>
					<div class="flex flex-col gap-1 text-gray-600 dark:text-gray-400">
						<span class="text-sm"
							><UIcon name="i-heroicons-star" class="text-gray-400 self-end" />
							{{ props.shop.averageScore > 0 ? props.shop.averageScore + " / 5" : "無評價" }}</span
						>
						<span class="text-sm"
							><UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="text-gray-400 self-end" />
							{{ props.shop.commentCount }} 則評論</span
						>
						<span class="text-sm"
							><UIcon name="i-heroicons-currency-dollar" class="text-gray-400 self-end" />
							{{ props.shop.averagePrice }} RMB</span
						>
						<span class="text-sm"
							><UIcon name="i-heroicons-map-pin" class="text-gray-400 self-end" /> {{ props.shop.cityName }}市
							{{ props.shop.address }}</span
						>
					</div>
				</div>
			</div>
		</NuxtLink>
	</div>
</template>
