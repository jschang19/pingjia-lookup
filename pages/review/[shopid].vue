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

interface ShopInfo {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
	cityName: string;
	rating: string;
	address: string;
}

const shopId = useRoute().params.shopid;
const page = ref(1);
const total = ref(0);
const reviews = ref<Review[]>([]);
const shopInfo = ref<ShopInfo>();

const handlePageChange = async (page: number) => {
	const { data } = await useFetch<{
		total: number;
		reviews: Review[];
	}>(`/api/review/${shopId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			current: (page - 1) * 10,
			pageSize: 10,
		}),
	});

	// set reviews
	reviews.value = data.value!.reviews;
};

const { data: apiReviews, error } = await useFetch<{
	total: number;
	reviews: Review[];
}>(`/api/review/${shopId}`, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		current: (page.value - 1) * 10,
		pageSize: 10,
	}),
});

if (error) {
	console.log(error);
}

const { data: ShopInfo } = await useFetch<{
	shop: ShopInfo;
}>(`/api/shop/${shopId}`, {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
});

const hasReiew = computed(() => reviews.value.length > 0);

watchEffect(() => {
	if (apiReviews.value) {
		reviews.value = apiReviews.value.reviews;
		total.value = apiReviews.value.total;
	}
});

watchEffect(() => {
	if (ShopInfo.value) {
		shopInfo.value = ShopInfo.value.shop;
	}
});

watch(
	() => page.value,
	async () => {
		await handlePageChange(page.value);
	},
);
</script>

<template>
	<div class="w-full my-[120px] mx-auto overflow-hidden">
		<div class="flex flex-col gap-3">
			<h1 class="text-2xl font-bold">
				{{ shopInfo?.name }} <span>{{ shopInfo?.branch }}</span>
			</h1>
			<UButton to="/" class="max-w-max" color="white">返回</UButton>
			<p>地址： {{ shopInfo?.cityName }}市 {{ shopInfo?.address }}</p>
			<div class="flex flex-row">
				<p class="text-xl font-medium">評價 {{ shopInfo?.rating }}</p>
			</div>
		</div>
		<div class="flex flex-col gap-4 my-4">
			<div v-if="hasReiew" class="flex flex-col gap-2">
				<ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
				<UPagination v-if="total > 10" :page-count="10" v-model="page" :total="total" />
			</div>
			<div v-else>目前沒有評論</div>
		</div>
	</div>
</template>
