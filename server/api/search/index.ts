import { totalmem } from "os";
import ShopService from "~/utils/mysql/shop";

export default eventHandler(async (event) => {
	try {
		// get post data
		const data = await readBody(event);

		const { name: searchName, city: searchCity, current, pageSize } = data;
		console.log(data);

		if (!data.name && !data.city) {
			setResponseStatus(event, 400);
			await send(event, "Bad Request");
			return;
		}

		// check if current and pageSize are numbers
		if (typeof current !== "number" || typeof pageSize !== "number") {
			setResponseStatus(event, 400);
			await send(event, "Bad Request");
			return;
		}

		let shops: any[] = [];
		let results: {
			total: number;
			rows: any[];
		} = { total: 0, rows: [] };

		if (searchName && searchCity) {
			results = await ShopService.getByCityAndName(searchCity, searchName, current, pageSize);
		} else if (searchName) {
			results = await ShopService.getByName(searchName, current, pageSize);
		} else {
			results = await ShopService.getByCity(searchCity, current, pageSize);
		}
		console.log(results.rows.length);
		shops = parseResults(results.rows);

		// return result as json
		setResponseStatus(event, 200);
		setResponseHeader(event, "Content-Type", "application/json");
		await send(
			event,
			JSON.stringify({
				total: results.total,
				shops,
			}),
		);
		return;
	} catch (e) {
		console.log(e);
		setResponseStatus(event, 500);
		await send(event, "Internal Server Error");
		return;
	}
});

function parseResults(rows: any[]) {
	return rows.map((row: any) => {
		return {
			id: row.ShopID,
			name: row.ShopName,
			branch: row.ShopBranch,
			city: row.CityID,
			cityName: row.CityName,
			commentCount: row.CommentCount,
			averagePrice: row.AvgPrice,
		};
	});
}
