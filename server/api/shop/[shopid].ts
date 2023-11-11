import ShopService from "@/server/utils/mysql/shop";
import { parseShopResults } from "@/server/utils/parse";

export default eventHandler(async (event) => {
	const shopId = event.context.params!.shopid as string;

	if (!shopId) {
		setResponseStatus(event, 400);
		await send(event, "Bad Request");
		return;
	}

	const results = await ShopService.getById(shopId);

	if (results[0].ShopID === null) {
		setResponseStatus(event, 404);
		await send(event, "Not Found");
		return;
	}

	setResponseStatus(event, 200);
	setResponseHeader(event, "Content-Type", "application/json");
	await send(
		event,
		JSON.stringify({
			shop: parseShopResults(results)[0],
		}),
	);
	return;
});
