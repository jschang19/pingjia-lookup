interface ShopInfo {
	info: any[];
	dishNames: any[];
	avgScore: any[];
	ratingCounts: any[];
	commentCount: any[];
}

// Utility function to calculate average score
function calculateAverageScore(row: any): number {
	return Math.round(((row.AvgTaste + row.AvgEnvironment + row.AvgService) / 3) * 10) / 10 || 0;
}

// Utility function to parse rating counts
function parseRatingCounts(row: any): Record<string, number> {
	const ratings: Record<string, number> = {};
	for (let i = 0; i <= 5; i++) {
		ratings[i] = Number(row[`RatingCount${i} `]) || 0;
	}
	return ratings;
}

function parseDishNames(row: any): string[] {
	// check if row.DishNames is a string
	try {
		if (row === null) return [];
		if (!row.hasOwnProperty("DishNames")) return [];
		return row.DishNames.split(", ").slice(0, 3);
	} catch (e) {
		return [];
	}
}

export function parseShopResults(rows: any[]) {
	return rows.map((row) => ({
		id: row.ShopID,
		name: row.ShopName,
		branch: row.ShopBranch,
		city: row.CityID,
		cityName: row.CityName,
		commentCount: row.ActualCommentCount,
		averagePrice: row.AvgPrice || "--",
		averageScore: calculateAverageScore(row),
		ratingCounts: parseRatingCounts(row),
		address: row.ShopAddress || "無資料",
	}));
}

export function parseSingleShopResult(shop: ShopInfo) {
	const info = shop.info[0];
	const dishNames = parseDishNames(shop.dishNames[0]);
	const avgScores = shop.avgScore[0];
	const ratingCounts = shop.ratingCounts[0];
	const commentCount = shop.commentCount[0];

	return {
		id: info.ShopID,
		name: info.ShopName,
		branch: info.ShopBranch,
		city: info.CityID,
		cityName: info.CityName,
		commentCount: commentCount.CommentCount,
		averagePrice: info.AvgPrice || "--",
		averageScore: calculateAverageScore(avgScores),
		ratingCounts: parseRatingCounts(ratingCounts),
		address: info.ShopAddress || "無資料",
		dishTypes: dishNames,
	};
}

export function parseCommentResults(results: any[]) {
	return results.map((result: any) => {
		const average = Math.round((result.CommentTaste + result.CommentEnvironment + result.CommentService) / 3);
		return {
			id: result.CommentID,
			shopId: result.ShopID,
			author: result.Author,
			scores: {
				taste: result.CommentTaste,
				environment: result.CommentEnvironment,
				service: result.CommentService,
				average,
			},
			content: result.Review,
			averagePrice: result.AvgPrice,
			createdAt: parseDate(result.CommentDate),
		};
	});
}
export function parseDate(date: string) {
	// yyyy-mm-dd
	const dateObj = new Date(date);
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth() + 1;
	const day = dateObj.getDate();
	return `${year}-${month}-${day}`;
}
