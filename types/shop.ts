interface Shop {
	id: string;
	name: string;
	branch: string;
	commentNum: string;
	averagePrice: string;
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

export type { Shop, ShopInfo };
