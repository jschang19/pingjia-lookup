<script setup lang="ts">
import { type ShopInfo } from "~/types/shop";
defineProps<{
	shopInfo: ShopInfo;
}>();
</script>
<template>
	<div class="flex flex-col gap-2 pb-4">
		<h1 class="text-2xl font-bold">
			{{ shopInfo?.name }} <span>{{ shopInfo?.branch }}</span>
		</h1>
		<div class="flex gap-2">
			<div class="flex items-center gap-1">
				<UIcon name="i-heroicons-star-solid" class="text-yellow-400 text-md" />
				<span>{{ shopInfo?.averageScore }}</span>
				<span class="text-sm text-gray-400 dark:text-gray-700">( {{ shopInfo?.commentCount }} 則評論)</span>
			</div>
		</div>
		<div class="flex gap-2">
			<UBadge
				:ui="{ rounded: 'rounded-full' }"
				v-for="dishType in shopInfo?.dishTypes"
				color="black"
				variant="solid"
				class="max-w-max"
				>#{{ dishType }}</UBadge
			>
		</div>
	</div>
</template>
