<script setup lang="ts">
const page = ref(1);
const total = ref(0);
const hasSearched = ref(false);

interface ShopInfo {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
	rating: string;
	address: string;
}

interface Response {
	shops: ShopInfo[];
	total: number;
}

const searchData = reactive({
	city: "",
	name: "",
});

const cityOptions = ref<
	{
		label: string;
		value: string;
	}[]
>([]);

const orderOptions = ref<
	{
		label: string;
		value: string;
	}[]
>([
	{
		label: "評價最高",
		value: "rating_desc",
	},
	{
		label: "價格最高",
		value: "averagePrice_desc",
	},
	{
		label: "價格最低",
		value: "averagePrice_asc",
	},
]);

const shops = ref<ShopInfo[]>([]);

const handleSearch = async () => {
	if (!searchData.city && !searchData.name) {
		return;
	}
	hasSearched.value = true;
	// post to api
	const { data: apiShops } = await useFetch<Response>("/api/search", {
		method: "POST",
		body: JSON.stringify({
			...searchData,
			current: 0,
			pageSize: 10,
		}),
	});
	shops.value = apiShops.value!.shops || [];
	total.value = apiShops.value!.total || 0;
	page.value = 1;
};

const handlePageChange = async (page: number) => {
	const { data: apiShops, pending: shopPending } = await useFetch<Response>("/api/search", {
		method: "POST",
		body: JSON.stringify({
			...searchData,
			current: (page - 1) * 10,
			pageSize: 10,
		}),
	});
	shops.value = apiShops.value!.shops || [];
	total.value = apiShops.value!.total || 0;
};

const handleReset = () => {
	searchData.city = "";
	searchData.name = "";
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
	return cityOptions.value.find((city) => city.value === searchData.city);
});

const hasShop = computed(() => {
	return shops.value.length > 0;
});

watch(
	() => searchData.city,
	async () => {
		if (searchData.name) {
			searchData.name = "";
		}
	},
);

watch(
	() => page.value,
	async () => {
		await handlePageChange(page.value);
	},
);
</script>
<template>
	<div class="w-full my-[120px] mx-auto">
		<h1 class="mb-12 text-4xl font-bold u-text-white text-left">餐廳評價</h1>
		<div class="flex flex-col md:flex-row gap-3">
			<USelectMenu
				v-model="searchData.city"
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
				<UInput placeholder="請輸入關鍵字" size="lg" class="grow" v-model="searchData.name" />
				<UButton size="lg" color="black" @click="handleSearch" class="px-5">搜尋</UButton>
			</div>
		</div>
		<div class="gap-4 my-4">
			<div v-if="hasShop" class="flex flex-col gap-3">
				<UDivider />
				<h2 class="text-lg font-semibold">{{ total }} 筆餐廳結果</h2>
				<ShopResult v-for="shop in shops" :key="shop.id" :shop="shop" />
				<UPagination v-if="hasShop" v-model="page" :page-count="10" :total="total" />
			</div>
			<div v-else-if="!hasShop && hasSearched" class="text-md text-center text-gray-300 mt-10">No Shops</div>
		</div>
	</div>
</template>
