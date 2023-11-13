<script setup lang="ts">
import { type ShopDetail } from "~/types/shop";
defineProps<{
	shopInfo: ShopDetail;
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
				<span class="text-sm text-gray-400 dark:text-gray-500">( {{ shopInfo?.commentCount }} 則評論 )</span>
			</div>
		</div>
		<div class="flex gap-2">
			<UBadge
				v-for="dishType in shopInfo.dishTypes"
				:key="dishType"
				:ui="{ rounded: 'rounded-full' }"
				color="black"
				variant="solid"
				class="max-w-max"
			>
				#{{ dishType }}
			</UBadge>
		</div>
	</div>
</template>
