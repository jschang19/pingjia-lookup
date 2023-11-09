<script setup lang="ts">
interface Shop {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
}

const props = defineProps({
	shop: {
		type: Object as PropType<Shop>,
		required: true,
	},
});

const shopUrl = computed(() => `/review/${props.shop.id}`);
</script>

<template>
	<UCard class="w-full" as="a" :href="shopUrl">
		<div class="flex flex-col gap-2">
			<div class="flex flex-row gap-3">
				<h3 class="text-lg font-bold self-center">{{ props.shop.name }}</h3>
				<span class="text-sm self-center text-gray-500 dark:text-gray-400">{{ props.shop.branch }}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-sm"
					><UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="text-gray-400 self-end" />
					{{ props.shop.commentCount }} 則評論</span
				>
				<span class="text-sm"
					><UIcon name="i-heroicons-currency-dollar" class="text-gray-400 self-end" />平均價位:
					{{ props.shop.averagePrice }} RMB</span
				>
			</div>
		</div>
	</UCard>
</template>
