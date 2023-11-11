<script setup lang="ts">
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

interface ShopInfo {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: string;
	averageScore: number;
	cityName: string;
	rating: string;
	address: string;
	dishTypes: string[];
	ratingCounts: {
		0: number;
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
}

type RatingCountKeys = keyof ShopInfo["ratingCounts"];

const shopId = useRoute().params.shopid;
const page = ref(1);
const total = ref(0);
const comments = ref<Comment[]>([]);
const shopInfo = ref<ShopInfo>();
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

	// set comments
	data.comments.forEach((comment) => {
		comments.value.push(comment);
	});
};

const initialComments = await commentService.fetchComments({
	shopId,
	current: 0,
	pageSize: page.value * pageSize,
	orderBy: selectedSortOption.value.value,
});

const { data: ShopInfo } = await useFetch<{
	shop: ShopInfo;
}>(`/api/shop/${shopId}`, {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
});


const hasReiew = computed(() => comments.value.length > 0);
const hasMore = computed(() => comments.value.length < total.value);

watchEffect(() => {
	if (initialComments) {
		comments.value = initialComments.comments;
		total.value = initialComments.total;
	}
});

watchEffect(() => {
	if (ShopInfo.value) {
		shopInfo.value = ShopInfo.value.shop;
	}
});

watch(
	() => selectedSortOption.value,
	async () => {
		if (selectedSortOption.value) {
			await fecthNewSort(page.value);
		}
	},
);
</script>

<template>
	<div class="w-full my-[120px] mx-auto overflow-hidden">
		<div class="flex flex-col gap-4 pb-6">
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
			<div class="flex flex-row">
				<p class="text-xl font-medium">評論</p>
			</div>
			<div class="flex flex-row justify-stretch items-center">
				<div class="flex flex-col gap-1 justify-center items-center w-1/2">
					<CommentRatingOverview :averageScore="shopInfo?.averageScore!" :total="total" />
				</div>
				<div class="flex justify-center items-start w-2/5 md:w-1/4">
					<CommentBarChart :ratingCounts="shopInfo?.ratingCounts!" :total="total" />
				</div>
			</div>
			<UDivider />
			<div class="flex flex-col gap-2">
				<div class="flex justify-end pb-2">
					<USelectMenu
						v-if="hasReiew"
						size="sm"
						class="max-w-max min-w-[125px]"
						v-model="selectedSortOption"
						:options="sortOption"
					/>
				</div>
				<div v-if="hasReiew" class="flex flex-col gap-1">
					<CommentCard v-for="comment in comments" :key="comment.id" :comment="comment" />
					<UButton v-show="hasMore" class="justify-center" variant="ghost" @click="handleLoadMore">顯示更多</UButton>
				</div>
				<div v-else class="text-sm text-center text-gray-500 dark:text-gray-500">目前沒有評論</div>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<p class="text-xl font-medium">基本資訊</p>
			<p class="text-sm">地址： {{ shopInfo?.cityName }}市 {{ shopInfo?.address }}</p>
		</div>
	</div>
</template>
