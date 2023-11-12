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

const searchStore = useSearchStore();
const toast = useToast();
const hasSearched = ref(false);
const isLoading = ref(false);
const cityOptions = ref<
	{
		label: string;
		value: string;
	}[]
>([]);

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
		const { data, error } = await useFetch<Response>(`/api/search`, {
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
			key: `search_${city}_${name}_${current}_${pageSize}_${orderBy}`,
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

	getCache(page: number, pageSize: number, last: boolean = false) {
		const { data: cachedStores } = useNuxtData(
			`search_${last ? searchStore.lastSearchData.city : searchStore.inputSearchData.city}_${
				last ? searchStore.lastSearchData.name : searchStore.inputSearchData.name
			}_${page}_${pageSize}_${searchStore.sortMethod}`,
		);
		if (cachedStores.value) {
			return cachedStores.value;
		}
		return null;
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
		const cachedShops = shopApiService.getCache(0, 10);
		if (cachedShops) {
			searchStore.shops = cachedShops.shops;
			searchStore.total = cachedShops.total;
			searchStore.page = 1;
			return;
		}
		const data = await shopApiService.fetchShops({
			...searchStore.inputSearchData,
			current: 0,
			pageSize: 10,
			orderBy: searchStore.sortMethod,
		});
		searchStore.shops = data.shops;
		searchStore.total = data.total;
		searchStore.page = 1;
	} catch (e) {
		console.log(e);
	}
};

const handlePageChange = async (page: number) => {
	try {
		const cachedShops = shopApiService.getCache((page - 1) * 10, 10, true);
		if (cachedShops) {
			searchStore.shops = cachedShops.shops;
			searchStore.total = cachedShops.total;
			return;
		}
		const data = await shopApiService.fetchShops({
			...searchStore.lastSearchData,
			current: (page - 1) * 10,
			pageSize: 10,
			orderBy: searchStore.sortMethod,
		});

		searchStore.shops = data.shops || [];
		searchStore.total = data.total || 0;
	} catch (e) {
		return;
	}
};

const handleSortChange = async (sortMethod: string) => {
	try {
		const cachedShops = shopApiService.getCache(0, 10, true);
		if (cachedShops) {
			searchStore.shops = cachedShops.shops;
			searchStore.total = cachedShops.total;
			return;
		}
		const data = await shopApiService.fetchShops({
			...searchStore.lastSearchData,
			current: 0,
			pageSize: 10,
			orderBy: sortMethod,
		});

		searchStore.shops = data.shops || [];
		searchStore.total = data.total || 0;
	} catch (e) {
		return;
	}
};

const { data: cities } = useNuxtData("cities");

if (cities.value) {
	cityOptions.value = cities.value.map((city: any) => ({
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
		cityOptions.value = [];
	} else {
		cityOptions.value = apiCities.value!.map((city) => ({
			label: city.name,
			value: city.id,
		}));
	}
}

const currentCity = computed(() => {
	return cityOptions.value.find((city) => city.value === searchStore.inputSearchData.city);
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
	() => searchStore.page,
	async () => {
		await handlePageChange(searchStore.page);
	},
);

watch(
	() => searchStore.sortMethod,
	async () => {
		if (searchStore.total === 1) return;
		searchStore.page = 1;
		await handleSortChange(searchStore.sortMethod);
	},
);
</script>
<template>
	<div class="w-full my-[120px] mx-auto">
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
						:options="cityOptions"
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
							:disabled="isLoading"
							placeholder="請輸入餐廳名稱或分類"
							size="lg"
							class="grow"
							v-model="searchStore.inputSearchData.name"
						/>
						<UButton :disabled="isLoading" size="lg" color="black" type="submit" class="px-5">搜尋</UButton>
					</div>
				</UForm>
				<div class="flex justify-start md:justify-end mt-3">
					<UButton size="xs" color="gray" @click="searchStore.resetSearchData" variant="ghost">清除條件</UButton>
				</div>
			</div>
			<div class="gap-4 my-4">
				<div v-if="hasShop" class="flex flex-col gap-3">
					<UDivider />
					<div class="flex flex-row justify-end gap-2">
						<USelect size="sm" v-model="searchStore.sortMethod" :options="searchStore.sortOptions" />
					</div>
					<ShopResult v-for="shop in searchStore.shops" :key="shop.id" :shop="shop" />
					<UPagination
						v-if="hasShop && searchStore.total > 10"
						v-model="searchStore.page"
						:page-count="10"
						:total="searchStore.total"
					/>
				</div>
				<div v-else-if="!hasShop && hasSearched && !isLoading" class="text-md text-center text-gray-300 mt-10">
					沒有符合條件的餐廳
				</div>
				<div v-else-if="isLoading" class="text-sm text-gray-500 dark:text-gray-600 text-center mt-10">稍等一下..</div>
			</div>
		</ClientOnly>
	</div>
</template>
