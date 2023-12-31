<script setup lang="ts">
import { useSearchStore } from "~/stores/search";
import { type ShopInfo } from "~/types/shop";
interface Response {
	shops: ShopInfo[];
	total: number;
}
definePageMeta({
	keepalive: true,
});

useHead({
	title: "評呷名 - 餐廳評論找尋器",
	meta: [
		{
			name: "description",
			content: "Find something good to eat 😋",
		},
		{
			name: "keywords",
			content: "評呷名, 餐廳, 評論, 找尋器",
		},
		{
			name: "robots",
			content: "noindex, nofollow",
		},
	],
});

useSeoMeta({
	ogImage: "https://jcshawn.com/wp-content/uploads/2023/11/restshawn-banner.jpg",
});

const searchStore = useSearchStore();
const toast = useToast();
const hasSearched = ref(false);
const isLoading = ref(false);
const pageSize = 20;

const shopApiService = {
	async fetchShops({
		city,
		name,
		current,
		pageSize,
		orderBy,
	}: {
		city: string;
		name: string;
		current: number;
		pageSize: number;
		orderBy: string;
	}): Promise<Response> {
		isLoading.value = true;
		const { data, error } = await useFetch<Response>("/api/search", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				city,
				name,
				current,
				pageSize,
				orderBy,
			}),
		});
		if (error.value) {
			toast.add({
				id: "search_error",
				title: "搜尋失敗",
				description: "請重新整理頁面再試",
				icon: "i-heroicons-information-circle",
				color: "red",
				timeout: 2000,
			});
		}
		isLoading.value = false;
		return data.value!;
	},
};

const handleSearch = async () => {
	if (!searchStore.inputSearchData.city && !searchStore.inputSearchData.name) {
		toast.add({
			id: "search_input_required",
			title: "請至少輸入一個搜尋條件",
			icon: "i-heroicons-information-circle",
			timeout: 2200,
		});
		return;
	}
	if (
		searchStore.inputSearchData.name === searchStore.lastSearchData.name &&
		searchStore.inputSearchData.city === searchStore.lastSearchData.city
	) {
		return;
	}
	hasSearched.value = true;
	try {
		searchStore.setLastSearchData({
			city: searchStore.inputSearchData.city,
			name: searchStore.inputSearchData.name,
		});

		const data = await shopApiService.fetchShops({
			...searchStore.inputSearchData,
			current: 0,
			pageSize,
			orderBy: searchStore.sortMethod,
		});
		searchStore.shops = data.shops;
		searchStore.total = data.total;
		searchStore.page = 1;
	} catch (e) {
		console.log(e);
	}
};

const handlePageChange = async () => {
	try {
		searchStore.page++;
		const data = await shopApiService.fetchShops({
			...searchStore.lastSearchData,
			current: (searchStore.page - 1) * pageSize,
			pageSize,
			orderBy: searchStore.sortMethod,
		});

		data.shops.forEach((shop) => {
			searchStore.shops.push(shop);
		});
		searchStore.total = data.total || 0;
	} catch (e) {}
};

const handleSortChange = async (sortMethod: string) => {
	try {
		const data = await shopApiService.fetchShops({
			...searchStore.lastSearchData,
			current: 0,
			pageSize,
			orderBy: sortMethod,
		});

		searchStore.shops = data.shops || [];
		searchStore.total = data.total || 0;
	} catch (e) {}
};

const { data: cities } = useNuxtData("cities");

if (cities.value && searchStore.cityOptions.length === 0) {
	searchStore.cityOptions = cities.value.map((city: { id: string; name: string }) => ({
		label: city.name,
		value: city.id,
	}));
} else {
	const { data: apiCities, error } = await useFetch<
		{
			id: string;
			name: string;
		}[]
	>("/api/city", {
		key: "cities",
	});

	if (error.value) {
		toast.add({
			id: "search_error",
			title: "搜尋失敗",
			description: "請稍後再試",
			icon: "i-heroicons-information-circle",
			color: "red",
			timeout: 2000,
		});
		searchStore.cityOptions = [];
	} else {
		searchStore.cityOptions = apiCities.value!.map((city) => ({
			label: city.name,
			value: city.id,
		}));
	}
}

const currentCity = computed(() => {
	return searchStore.cityOptions.find((city) => city.value === searchStore.inputSearchData.city);
});

const hasShop = computed(() => {
	return searchStore.shops.length > 0;
});

watch(
	() => searchStore.inputSearchData.city,
	() => {
		// flush name
		if (searchStore.inputSearchData.name) {
			searchStore.inputSearchData.name = "";
		}
	},
);

watch(
	() => searchStore.sortMethod,
	async () => {
		if (searchStore.total === 1) {
			return;
		}
		searchStore.page = 1;
		await handleSortChange(searchStore.sortMethod);
	},
);
</script>
<template>
	<div class="w-full">
		<ClientOnly>
			<div class="flex flex-col gap-3 mb-6">
				<h1 class="text-3xl font-bold u-text-white text-left">評呷名</h1>
				<h2 class="text-md text-gray-500 dark:text-gray-300 font-medium u-text-white text-left">
					Find something good to eat 😋
				</h2>
			</div>
			<div>
				<UForm :state="searchStore.inputSearchData" class="flex flex-col md:flex-row gap-3" @submit="handleSearch">
					<USelectMenu
						v-model="searchStore.inputSearchData.city"
						:options="searchStore.cityOptions"
						value-attribute="value"
						size="lg"
						class="max-md:max-w-full max-md:grow min-w-[125px]"
						searchable
						searchable-placeholder="請輸入城市"
					>
						<template #label>
							{{ currentCity?.label || "請選擇城市" }}
						</template>
					</USelectMenu>
					<div class="flex row gap-3 grow">
						<UInput
							v-model="searchStore.inputSearchData.name"
							:disabled="isLoading"
							placeholder="請輸入餐廳名稱或分類"
							size="lg"
							class="grow"
						/>
						<UButton :disabled="isLoading" size="lg" color="black" type="submit" class="px-5"> 搜尋 </UButton>
					</div>
				</UForm>
				<div class="flex justify-start md:justify-end mt-3">
					<UButton size="xs" color="gray" variant="ghost" @click="searchStore.resetSearchData"> 清除條件 </UButton>
				</div>
			</div>
			<div class="gap-4 my-4">
				<div v-if="hasShop" class="flex flex-col gap-3">
					<UDivider />
					<div class="flex flex-row justify-end gap-2">
						<USelect v-model="searchStore.sortMethod" size="sm" :options="searchStore.sortOptions" />
					</div>
					<ShopResult v-for="shop in searchStore.shops" :key="shop.id" :shop="shop" />
					<UButton
						v-show="searchStore.shops.length < searchStore.total"
						variant="ghost"
						size="lg"
						class="justify-center"
						:loading="isLoading"
						@click="handlePageChange"
					>
						{{ isLoading ? "載入中.." : "顯示更多" }}
					</UButton>
				</div>
				<div v-else-if="!hasShop && hasSearched && !isLoading" class="text-md text-center text-gray-300 mt-10">
					沒有符合條件的餐廳
				</div>
				<div v-else-if="isLoading" class="text-sm text-gray-500 dark:text-gray-600 text-center mt-10">稍等一下..</div>
			</div>
		</ClientOnly>
	</div>
</template>
