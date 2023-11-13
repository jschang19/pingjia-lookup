interface Shop {
	id: string;
	name: string;
	branch: string;
	commentNum: string;
	averagePrice: string;
}

interface RowRatingCounts {
	RatingCount0: number;
	RatingCount1: number;
	RatingCount2: number;
	RatingCount3: number;
	RatingCount4: number;
	RatingCount5: number;
}

type RatingCountKeys = {
	[K in 0 | 1 | 2 | 3 | 4 | 5]: number;
};

interface ShopInfo {
	id: string;
	name: string;
	branch: string;
	commentCount: string;
	averagePrice: number | string;
	averageScore: number;
	cityName: string;
	ratingCounts: RatingCountKeys;
	address: string;
}

interface ShopDetail extends ShopInfo {
	rating: number;
	dishTypes: string[];
}

export type { Shop, ShopInfo, ShopDetail, RowRatingCounts, RatingCountKeys };
