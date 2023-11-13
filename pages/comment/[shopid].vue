<script setup lang="ts">
import { type ShopInfo } from "~/types/shop";
interface Comment {
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

const shopId = useRoute().params.shopid;
const page = ref(1);
const total = ref(0);
const comments = ref<Comment[]>([]);
const shopInfo = ref<ShopInfo | null>();
const recommend = ref<ShopInfo[]>();
const pageSize = 4;
const sortOption = [
	{
		label: "日期",
		value: "latest",
	},
	{
		label: "評分(高至低)",
		value: "score",
	},
	{
		label: "評分(低至高)",
		value: "score_asc",
	},
];
const selectedSortOption = ref(sortOption[0]);

interface FetchCommentsParams {
	shopId: string | string[];
	current: number;
	pageSize: number;
	orderBy: string; // Assuming orderBy is optional
}

const handleLoadMore = async () => {
	page.value += 1;
	await fecthLoadMore(page.value);
};

interface CommentResponse {
	total: number;
	comments: Comment[]; // Replace 'Comment' with the actual type of your comments
}

interface RecommedResponse {
	recommend: ShopInfo[];
}

const commentService = {
	async fetchComments({ shopId, current, pageSize, orderBy }: FetchCommentsParams): Promise<CommentResponse> {
		const { data } = await useFetch<CommentResponse>(`/api/comment/${shopId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				current,
				pageSize,
				orderBy,
			}),
		});
		return data.value!;
	},
};

const fecthNewSort = async (page: number) => {
	const data = await commentService.fetchComments({
		shopId,
		current: 0,
		pageSize: page * pageSize,
		orderBy: selectedSortOption.value.value,
	});

	comments.value = data.comments;
};

const fecthLoadMore = async (page: number) => {
	const data = await commentService.fetchComments({
		shopId,
		current: (page - 1) * pageSize,
		pageSize,
		orderBy: selectedSortOption.value.value,
	});

	data.comments.forEach((comment) => {
		comments.value.push(comment);
	});
};

try {
	const [{ data: apiRecommendShops }, apiComments, { data: apiShopInfo }] = await Promise.all([
		useFetch<RecommedResponse>(`/api/shop/recommend/${shopId}`, {
			method: "GET",
		}),
		commentService.fetchComments({
			shopId,
			current: 0,
			pageSize: page.value * pageSize,
			orderBy: selectedSortOption.value.value,
		}),
		useFetch<{
			shop: ShopInfo;
		}>(`/api/shop/${shopId}`, {
			method: "GET",
		}),
	]);

	recommend.value = apiRecommendShops.value!.recommend;
	comments.value = apiComments.comments;
	total.value = apiComments.total;
	shopInfo.value = apiShopInfo.value!.shop;
} catch (e) {
	console.log(e);
}

const hasReiew = computed(() => comments.value.length > 0);
const hasMore = computed(() => comments.value.length < total.value);
const hasShopInfo = computed(() => shopInfo.value !== null);

watch(
	() => selectedSortOption.value,
	async () => {
		if (selectedSortOption.value) {
			if (total.value < 2) {
				return;
			} // no need to sort
			await fecthNewSort(page.value);
		}
	},
);

useHead({
	title: `${shopInfo.value?.name} ${shopInfo.value?.branch} 的顧客評論 - 評呷名`,
	meta: [
		{
			hid: "description",
			name: "description",
			content: `${shopInfo.value?.name} ${shopInfo.value?.branch} 的顧客評論 - 評呷名`,
		},
	],
});
useSeoMeta({
	ogImage: "https://jcshawn.com/wp-content/uploads/2023/11/restshawn-banner.jpg",
});
</script>

<template>
	<div class="w-full mx-auto overflow-hidden">
		<div v-if="hasShopInfo">
			<div class="flex flex-col gap-4 pb-6">
				<CommentTopHeading :shop-info="shopInfo!" />
				<div class="flex flex-row">
					<p class="text-xl font-medium">評論</p>
				</div>
				<div class="flex flex-row justify-stretch items-center">
					<div class="flex flex-col gap-1 justify-center items-center w-1/2">
						<CommentRatingOverview :average-score="shopInfo?.averageScore!" :total="total" />
					</div>
					<div class="flex justify-center items-start w-2/5 md:w-1/4">
						<CommentBarChart :rating-counts="shopInfo?.ratingCounts!" :total="total" />
					</div>
				</div>
				<UDivider />
				<div class="flex flex-col gap-2">
					<div class="flex justify-end pb-2">
						<USelectMenu
							v-if="hasReiew"
							v-model="selectedSortOption"
							size="sm"
							class="max-w-max min-w-[125px]"
							:options="sortOption"
						/>
					</div>
					<div v-if="hasReiew" class="flex flex-col gap-1">
						<CommentContentWrapper v-for="comment in comments" :key="comment.id" :comment="comment" />
						<UButton v-show="hasMore" class="justify-center" variant="ghost" @click="handleLoadMore">
							顯示更多
						</UButton>
					</div>
					<div v-else class="text-sm text-center text-gray-500 dark:text-gray-500">目前沒有評論</div>
				</div>
			</div>
			<div class="flex flex-col gap-10">
				<div class="flex flex-col gap-2">
					<h3 class="text-xl font-medium">基本資訊</h3>
					<p class="text-sm">地址： {{ shopInfo?.cityName }}市 {{ shopInfo?.address }}</p>
				</div>
				<UDivider />
				<div v-if="recommend!.length > 0" class="flex flex-col gap-2">
					<h3 class="text-xl font-medium">你可能還會喜歡⋯</h3>
					<ShopResult v-for="shop in recommend" :key="shop.id" :shop="shop" />
				</div>
			</div>
		</div>
		<div v-else class="flex flex-col items-center gap-3">
			<div class="flex flex-col text-center gap-2">
				<div class="text-xl font-bold">餐廳不存在</div>
				<div class="text-sm">踏破鐵鞋尋覓處，轉角就有得來速</div>
			</div>
			<ULink to="/">
				<UButton size="sm" variant="ghost"> 回首頁 </UButton>
			</ULink>
		</div>
	</div>
</template>
