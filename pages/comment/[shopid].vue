<script setup lang="ts">
interface comment {
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
const comments = ref<comment[]>([]);
const comments = ref<Comment[]>([]);
const shopInfo = ref<ShopInfo>();
const pageSize = 4;
const order = ref<"latest" | "score" | "score_asc">("latest");
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

const handleLoadMore = async () => {
	page.value += 1;
	await fecthLoadMore(page.value);
};

const fecthLoadMore = async (page: number) => {
	const { data } = await useFetch<{
		total: number;
		comments: comment[];
	}>(`/api/comment/${shopId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			current: (page - 1) * pageSize,
			pageSize: pageSize,
		}),
	});

	// set comments
	data.value!.comments.forEach((comment) => {
		comments.value.push(comment);
	});
};

const { data: apicomments, error } = await useFetch<{
	total: number;
	comments: comment[];
}>(`/api/comment/${shopId}`, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		current: (page.value - 1) * pageSize,
		pageSize: pageSize,
	}),
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

const sortCommentsByDate = () => {
	const tmp = comments.value;
	tmp.sort((a, b) => {
		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
	comments.value = tmp;
};

const sortCommentsByRating = () => {
	const tmp = comments.value;
	tmp.sort((a, b) => {
		return b.scores.average - a.scores.average;
	});
	comments.value = tmp;
};

const sortCommentsByLowRating = () => {
	const tmp = comments.value;
	tmp.sort((a, b) => {
		return a.scores.average - b.scores.average;
	});
	comments.value = tmp;
};

watchEffect(() => {
	if (apicomments.value) {
		comments.value = apicomments.value.comments;
		total.value = apicomments.value.total;
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
			console.log("hi");
			switch (selectedSortOption.value.value) {
				case "latest":
					sortCommentsByDate();
					break;
				case "score":
					sortCommentsByRating();
					break;
				case "score_asc":
					sortCommentsByLowRating();
					break;
			}
		}
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
			<div class="flex flex-row">
				<p class="text-xl font-medium">評論</p>
			</div>
			<div class="flex flex-row justify-stretch items-center">
				<div class="flex flex-col gap-1 justify-center items-center w-1/2">
					<p class="text-sm text-gray-400 dark:text-gray-400">{{ total }} 則評論</p>
					<p class="text-4xl font-bold">{{ shopInfo?.averageScore }}</p>
					<div class="flex">
						<UIcon
							v-for="star in Math.round(shopInfo?.averageScore!)"
							:key="star"
							name="i-heroicons-star-solid"
							class="text-yellow-400 text-md"
						/>
						<UIcon
							v-for="star in (5 - Math.round(shopInfo?.averageScore!))"
							:key="star"
							name="i-heroicons-star"
							class="text-yellow-400 text-md"
						/>
					</div>
				</div>
				<div class="flex justify-center items-start w-1/4">
					<div class="flex flex-col gap-1 w-full">
						<div class="flex items-center gap-1" v-for="index in 5" :key="index">
							<span class="text-xs text-gray-400 dark:text-gray-400">{{ index }}</span>
							<UProgress :value="shopInfo?.ratingCounts[index as RatingCountKeys]" :max="total" />
							<span class="text-xs text-gray-300 dark:text-gray-400">{{
								shopInfo?.ratingCounts[index as RatingCountKeys]
							}}</span>
						</div>
					</div>
				</div>
			</div>
			<UDivider />
			<div class="flex flex-col gap-3 my-4">
				<div class="flex justify-end">
					<USelectMenu size="sm" class="max-w-max min-w-[130px]" v-model="selectedSortOption" :options="sortOption" />
				</div>
				<div v-if="hasReiew" class="flex flex-col gap-2">
					<CommentCard v-for="comment in comments" :key="comment.id" :comment="comment" />
					<UButton v-show="hasMore" class="justify-center" variant="ghost" @click="handleLoadMore">顯示更多</UButton>
				</div>
				<div v-else>目前沒有評論</div>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<p class="text-xl font-medium">基本資訊</p>
			<p class="text-sm">地址： {{ shopInfo?.cityName }}市 {{ shopInfo?.address }}</p>
		</div>
	</div>
</template>
