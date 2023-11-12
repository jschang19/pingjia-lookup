import ShopService from "@/server/utils/mysql/shop";
import { parseShopResults } from "@/server/utils/parse";

export default eventHandler(async (event) => {
	const shopId = event.context.params!.shopid as string;

	if (!shopId) {
		setResponseStatus(event, 400);
		await send(event, "Bad Request");
		return;
	}

	const results = await ShopService.getRecommendById(shopId);

	if (results.rows.length === 0) {
		setResponseStatus(event, 200);
		setResponseHeader(event, "Content-Type", "application/json");
		await send(event, JSON.stringify({ recommend: [] }));
		return;
	}

	setResponseStatus(event, 200);
	setResponseHeader(event, "Content-Type", "application/json");
	await send(
		event,
		JSON.stringify({
			recommend: parseShopResults(results.rows),
		}),
	);
	return;
});
