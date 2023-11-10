import ReviewService from "@/server/utils/mysql/review";

export default eventHandler(async (event) => {
	const { shopid: shopId } = event.context.params as { shopid: string };
	const { current, pageSize, orderBy } = await readBody(event);

	if (!shopId) {
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

	const results = await ReviewService.getByShopId(shopId, current, pageSize, "CommentID");
	setResponseStatus(event, 200);
	setResponseHeader(event, "Content-Type", "application/json");
	await send(
		event,
		JSON.stringify({
			total: results.total,
			reviews: parseReviewResults(results.rows),
		}),
	);
});

function parseReviewResults(results: any[]) {
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
function parseDate(date: string) {
	// yyyy-mm-dd
	const dateObj = new Date(date);
	const year = dateObj.getFullYear();
	const month = dateObj.getMonth() + 1;
	const day = dateObj.getDate();
	return `${year}-${month}-${day}`;
}
