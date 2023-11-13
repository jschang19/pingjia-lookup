import { RowDataPacket } from "mysql2/promise";
import { type RowRatingCounts, type ShopInfo } from "~/types/shop";

type RatingCountKeys = {
	[K in 0 | 1 | 2 | 3 | 4 | 5]: number;
};

// Utility function to calculate average score
function calculateAverageScore(AvgTaste: number, AvgEnvironment: number, AvgService: number): number {
	return Math.round(((AvgTaste + AvgEnvironment + AvgService) / 3) * 10) / 10 || 0;
}

// Utility function to parse rating counts
function parseRatingCounts(row: RowRatingCounts): RatingCountKeys {
	const ratings: RatingCountKeys = {
		0: Number(row.RatingCount0) ?? 0,
		1: Number(row.RatingCount1) ?? 0,
		2: Number(row.RatingCount2) ?? 0,
		3: Number(row.RatingCount3) ?? 0,
		4: Number(row.RatingCount4) ?? 0,
		5: Number(row.RatingCount5) ?? 0,
	};
	return ratings;
}

function parseDishNames(row: RowDataPacket): string[] {
	// check if row.DishNames is a string
	try {
		if (row === null) {
			return [];
		}
		if (!row.DishNames) {
			return [];
		}
		return row.DishNames.split(", ").slice(0, 3);
	} catch (e) {
		return [];
	}
}

export function parseShopResults(rows: RowDataPacket[]): ShopInfo[] {
	return rows.map((row) => ({
		id: row.ShopID,
		name: row.ShopName,
		branch: row.ShopBranch,
		city: row.CityID,
		cityName: row.CityName,
		commentCount: row.ActualCommentCount,
		averagePrice: Math.round(row.AvgPrice * 10) / 10 || "--",
		averageScore: calculateAverageScore(row.AvgTaste, row.AvgEnvironment, row.AvgService),
		ratingCounts: parseRatingCounts({
			RatingCount0: row.RatingCount0,
			RatingCount1: row.RatingCount1,
			RatingCount2: row.RatingCount2,
			RatingCount3: row.RatingCount3,
			RatingCount4: row.RatingCount4,
			RatingCount5: row.RatingCount5,
		}),
		address: row.ShopAddress || "無資料",
	}));
}

export function parseSingleShopResult(shop: {
	info: RowDataPacket[];
	dishNames: RowDataPacket[];
	avgScore: RowDataPacket[];
	ratingCounts: RowDataPacket[];
	commentCount: RowDataPacket[];
}) {
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
		commentCount: commentCount.ActualCommentCount,
		averagePrice: Math.round(info.AvgPrice * 10) / 10 || "--",
		averageScore: calculateAverageScore(avgScores.AvgTaste, avgScores.AvgEnvironment, avgScores.AvgService),
		ratingCounts: parseRatingCounts({
			RatingCount0: ratingCounts.RatingCount0,
			RatingCount1: ratingCounts.RatingCount1,
			RatingCount2: ratingCounts.RatingCount2,
			RatingCount3: ratingCounts.RatingCount3,
			RatingCount4: ratingCounts.RatingCount4,
			RatingCount5: ratingCounts.RatingCount5,
		}),
		address: info.ShopAddress || "無資料",
		dishTypes: dishNames,
	};
}

export function parseCommentResults(results: RowDataPacket[]) {
	return results.map((result: RowDataPacket) => {
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
