export function parseShopResults(rows: any[]) {
	return rows.map((row: any) => {
		const averageScore = Math.round(((row.AvgTaste + row.AvgEnvironment + row.AvgService) / 3) * 10) / 10;
		return {
			id: row.ShopID,
			name: row.ShopName,
			branch: row.ShopBranch,
			city: row.CityID,
			cityName: row.CityName,
			commentCount: row.actualCommentCount,
			averagePrice: row.AvgPrice || "無資料",
			averageScore,
			ratingCounts: {
				0: Number(row.RatingCount0) || 0,
				1: Number(row.RatingCount1) || 0,
				2: Number(row.RatingCount2) || 0,
				3: Number(row.RatingCount3) || 0,
				4: Number(row.RatingCount4) || 0,
				5: Number(row.RatingCount5) || 0,
			},
			address: row.ShopAddress || "無資料",
		};
	});
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
