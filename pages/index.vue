<script setup lang="ts">
import { useSearchStore } from "~/stores/search";
definePageMeta({
	title: "評呷名",
	keepalive: true,
});

const searchStore = useSearchStore();
const total = ref(0);
const toast = useToast();
const hasSearched = ref(false);
const isLoading = ref(false);

interface ShopInfo {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
	averageScore: number;
	rating: string;
	address: string;
	cityName: string;
}

interface Response {
	shops: ShopInfo[];
	total: number;
}

const cityOptions = ref<
	{
		label: string;
		value: string;
	}[]
>([]);

const sortOptions = ref<
	{
		label: string;
		value: string;
	}[]
>([
	{
		label: "評價最高",
		value: "rating",
	},
	{
		label: "價格最低",
		value: "price_asc",
	},
	{
		label: "價格最高",
		value: "price_desc",
	},
]);

const sortMethod = ref(sortOptions.value[0].value);
const shops = ref<ShopInfo[]>([]);

const shopApiService = {
	async fetchComments({
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
		const data = await shopApiService.fetchComments({
			...searchStore.inputSearchData,
			current: 0,
			pageSize: 10,
			orderBy: sortMethod.value,
		});
		shops.value = data.shops;
		total.value = data.total;
		searchStore.page = 1;
		searchStore.setLastSearchData({
			city: searchStore.inputSearchData.city,
			name: searchStore.inputSearchData.name,
		});
	} catch (e) {
		console.log(e);
	}
};

const handlePageChange = async (page: number) => {
	const data = await shopApiService.fetchComments({
		...searchStore.lastSearchData,
		current: (page - 1) * 10,
		pageSize: 10,
		orderBy: sortMethod.value,
	});

	shops.value = data.shops || [];
	total.value = data.total || 0;
};

const handleSortChange = async (sortMethod: string) => {
	const data = await shopApiService.fetchComments({
		...searchStore.lastSearchData,
		current: 0,
		pageSize: 10,
		orderBy: sortMethod,
	});

	shops.value = data.shops || [];
	total.value = data.total || 0;
};

const handleReset = () => {
	searchStore.inputSearchData.city = "";
	searchStore.inputSearchData.name = "";
};

const { data: apiCities } = await useFetch<
	{
		id: string;
		name: string;
	}[]
>("/api/city");

cityOptions.value = apiCities.value!.map((city) => ({
	label: city.name,
	value: city.id,
}));

const currentCity = computed(() => {
	return cityOptions.value.find((city) => city.value === searchStore.inputSearchData.city);
});

const hasShop = computed(() => {
	return shops.value.length > 0;
});

watch(
	() => searchStore.inputSearchData.city,
	async () => {
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
	() => sortMethod.value,
	async () => {
		searchStore.page = 1;
		await handleSortChange(sortMethod.value);
	},
);

onDeactivated(() => {
	searchStore.setLastSearchData({
		city: "",
		name: "",
	});
});
</script>
<template>
	<div class="w-full my-[120px] mx-auto">
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
				<UButton size="xs" color="gray" @click="handleReset" variant="ghost">清除條件</UButton>
			</div>
		</div>
		<div class="gap-4 my-4">
			<div v-if="hasShop" class="flex flex-col gap-3">
				<UDivider />
				<div class="flex flex-row justify-end gap-2">
					<USelect size="sm" v-model="sortMethod" :options="sortOptions" />
				</div>
				<ShopResult v-for="shop in shops" :key="shop.id" :shop="shop" />
				<UPagination v-if="hasShop && total > 10" v-model="searchStore.page" :page-count="10" :total="total" />
			</div>
			<div v-else-if="!hasShop && hasSearched && !isLoading" class="text-md text-center text-gray-300 mt-10">
				沒有符合條件的餐廳
			</div>
			<div v-else-if="isLoading" class="text-sm text-gray-500 dark:text-gray-600 text-center mt-10">稍等一下..</div>
		</div>
	</div>
</template>
