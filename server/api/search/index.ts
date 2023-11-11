import ShopService from "@/server/utils/mysql/shop";
import { traditionToSimple } from "chinese-simple2traditional";
import { parseShopResults } from "@/server/utils/parse";

export default eventHandler(async (event) => {
	try {
		// get post data
		const data = await readBody(event);

		const { name: searchName, city: searchCity, current, pageSize, orderBy } = data;

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

		let results: {
			total: number;
			rows: any[];
			shops?: any[];
		} = { total: 0, rows: [], shops: [] };

		// translate searchName to simplified Chinese
		// since the database is in simplified Chinese
		const simplifySearchName = traditionToSimple(searchName);

		if (searchName && searchCity) {
			results = await ShopService.getByCityAndName(searchCity, simplifySearchName, current, pageSize, orderBy);
		} else if (searchName) {
			results = await ShopService.getByName(simplifySearchName, current, pageSize, orderBy);
		} else {
			results = await ShopService.getByCity(searchCity, current, pageSize, orderBy);
		}
		results.shops = parseShopResults(results.rows);

		// return result as json
		setResponseStatus(event, 200);
		setResponseHeader(event, "Content-Type", "application/json");
		await send(
			event,
			JSON.stringify({
				total: results.total,
				shops: results.shops,
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
