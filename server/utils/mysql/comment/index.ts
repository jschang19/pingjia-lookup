import initConnection from "@/server/utils/mysql/connection";
import { type RowDataPacket } from "mysql2/promise";

interface CommentService {
	getByShopId: (
		shopId: string,
		offset: number,
		pageSize: number,
		orderBy: string,
	) => Promise<{
		total: number;
		rows: any[] | any;
	}>;
}

const CommentService: CommentService = {
	getByShopId: async (shopId: string, offset: number, pageSize: number, orderBy: string) => {
		const connection = await initConnection();

		switch (orderBy) {
			case "score":
				orderBy = "(CommentTaste + CommentEnvironment + CommentService) DESC, CommentDate DESC";
				break;
			case "score_asc":
				orderBy = "(CommentTaste + CommentEnvironment + CommentService) ASC, CommentDate DESC";
				break;
			case "latest":
				orderBy = "CommentDate DESC";
				break;
			default:
				orderBy = "CommentDate DESC";
				break;
		}

		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM shopcomment WHERE ShopID = ?", [shopId]),
			connection.query<RowDataPacket[]>(
				`SELECT * FROM shopcomment as scm WHERE ShopID = ? ORDER BY ${orderBy} LIMIT ?, ?`,
				[shopId, offset, pageSize],
			),
		]);
		const totalRows = total[0].total;
		return {
			total: totalRows,
			rows: rows,
		};
	},
};

export default CommentService;
