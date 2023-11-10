import CommentService from "@/server/utils/mysql/comment";
import { parseCommentResults } from "@/server/utils/parse";

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

	const results = await CommentService.getByShopId(shopId, current, pageSize, orderBy);

	setResponseStatus(event, 200);
	setResponseHeader(event, "Content-Type", "application/json");
	await send(
		event,
		JSON.stringify({
			total: results.total,
			comments: parseCommentResults(results.rows),
		}),
	);
});
