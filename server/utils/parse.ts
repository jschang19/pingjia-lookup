export function parseShopResults(rows: any[]) {
	return rows.map((row: any) => {
		return {
			id: row.ShopID,
			name: row.ShopName,
			branch: row.ShopBranch,
			city: row.CityID,
			cityName: row.CityName,
			commentCount: row.actualCommentCount,
			averagePrice: row.AvgPrice,
			address: row.ShopAddress,
		};
	});
}
