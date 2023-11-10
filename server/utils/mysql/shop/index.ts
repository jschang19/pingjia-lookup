import initConnection from "@/server/utils/mysql/connection";
import { type RowDataPacket } from "mysql2/promise";

const ShopService: {
	getByName: (
		name: string,
		offset: number,
		pageSize: number,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getByCity: (
		city: string,
		offset: number,
		pageSize: number,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getByCityAndName: (
		city: string,
		name: string,
		offset: number,
		pageSize: number,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getById: (id: string) => Promise<RowDataPacket[]>;
} = {
	getByName: async (name: string, offset: number, pageSize: number) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;
		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				"SELECT COUNT(*) AS total FROM shop AS s JOIN shopcity AS sc ON s.shopid = sc.shopid JOIN city AS c ON c.cityid = sc.cityid  WHERE `ShopName` LIKE ?",
				[likeTerm],
			),
			connection.query<RowDataPacket[]>(
				`SELECT s.*, c.CityName, COALESCE(commentData.actualCommentCount, 0) as actualCommentCount,
				COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
				COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
				COALESCE(avgScore.AvgService, 0) as AvgService
				FROM shop as s
				LEFT JOIN shopcity AS sc ON s.shopid = sc.shopid
				LEFT JOIN city AS c ON c.cityid = sc.cityid
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as actualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				LEFT JOIN 
						(
								SELECT 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService, 
										shopid
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				WHERE s.shopname like ?
				ORDER BY s.shopid
				LIMIT ?, ?;
				`,
				[likeTerm, offset, pageSize],
			),
		]);
		const totalRows = total[0].total;
		await connection.end();
		return {
			total: totalRows,
			rows: rows,
		};
	},

	getByCity: async (city: string, offset: number, pageSize: number) => {
		const connection = await initConnection();
		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				"SELECT COUNT(*) AS total FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ?",
				[city],
			),
			connection.query<RowDataPacket[]>(
				`SELECT s.*, c.CityName,
					COALESCE(commentData.actualCommentCount, 0) as actualCommentCount,
					COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
					COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
					COALESCE(avgScore.AvgService, 0) as AvgService
				FROM shop AS s
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as actualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				JOIN shopcity AS sc ON s.shopid = sc.ShopId
				JOIN city AS c ON c.cityid = sc.cityid
				LEFT JOIN 
						(
								SELECT 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService, 
										shopid
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				WHERE sc.CityID = ?
				ORDER BY s.shopid
				LIMIT ?, ?;`,
				[city, offset, pageSize],
			),
		]);

		const totalRows = total[0].total;
		await connection.end();
		return {
			total: totalRows,
			rows: rows,
		};
	},

	getByCityAndName: async (city: string, name: string, offset: number, pageSize: number) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;

		// promise all
		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				"SELECT COUNT(*) AS total FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ? AND s.ShopName LIKE ?",
				[city, likeTerm],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
				s.*, 
				c.CityName, 
				COALESCE(commentData.actualCommentCount, 0) as actualCommentCount,
				COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
				COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
				COALESCE(avgScore.AvgService, 0) as AvgService
				FROM 
					shopcity AS sc 
				JOIN 
					shop AS s ON s.shopid = sc.ShopId 
				JOIN 
					city AS c ON c.cityid = sc.cityid 
				LEFT JOIN 
					(
							SELECT shopid, COUNT(commentid) as actualCommentCount
							FROM shopcomment
							GROUP BY shopid
					) AS commentData ON s.shopid = commentData.shopid
				LEFT JOIN 
						(
								SELECT 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService, 
										shopid
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				WHERE 
						sc.CityID = ? AND s.ShopName LIKE ? 
				LIMIT ?, ?
		`,
				[city, likeTerm, offset, pageSize],
			),
		]);
		await connection.end();
		return {
			total: total[0].total,
			rows: rows,
		};
	},

	getById: async (id: string) => {
		const connection = await initConnection();
		const [rows] = await connection.query<RowDataPacket[]>(
			`SELECT 
						s.*, 
						c.CityName,
						avgScore.*,
						ratingCounts.*
				FROM 
						shop AS s 
				JOIN 
						shopcity AS sc ON s.shopid = sc.shopid
				JOIN 
						city AS c ON c.cityid = sc.cityid
				LEFT JOIN 
						(
								SELECT 
										shopid, 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				LEFT JOIN 
						(
								SELECT 
										shopid,
										COALESCE(SUM(CASE WHEN CommentTaste = 0 THEN 1 ELSE 0 END), 0) AS RatingCount0,
										COALESCE(SUM(CASE WHEN CommentTaste = 1 THEN 1 ELSE 0 END), 0) AS RatingCount1,
										COALESCE(SUM(CASE WHEN CommentTaste = 2 THEN 1 ELSE 0 END), 0) AS RatingCount2,
										COALESCE(SUM(CASE WHEN CommentTaste = 3 THEN 1 ELSE 0 END), 0) AS RatingCount3,
										COALESCE(SUM(CASE WHEN CommentTaste = 4 THEN 1 ELSE 0 END), 0) AS RatingCount4,
										COALESCE(SUM(CASE WHEN CommentTaste = 5 THEN 1 ELSE 0 END), 0) AS RatingCount5
								FROM shopcomment
								GROUP BY shopid
						) AS ratingCounts ON ratingCounts.shopid = s.shopid
				WHERE 
						s.shopid = ? 
				LIMIT 1	
				`,
			[id],
		);
		await connection.end();
		return rows;
	},
};

export default ShopService;
