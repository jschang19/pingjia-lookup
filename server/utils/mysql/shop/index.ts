import initConnection from "@/server/utils/mysql/connection";
import { type RowDataPacket } from "mysql2/promise";

const ShopService: {
	getByName: (
		name: string,
		offset: number,
		pageSize: number,
		orderBy: string,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getByCity: (
		city: string,
		offset: number,
		pageSize: number,
		orderBy: string,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getByCityAndName: (
		city: string,
		name: string,
		offset: number,
		pageSize: number,
		orderBy: string,
	) => Promise<{
		total: number;
		rows: RowDataPacket[];
	}>;
	getById: (id: string) => Promise<{
		info: RowDataPacket[];
		dishNames: RowDataPacket[];
		avgScore: RowDataPacket[];
		ratingCounts: RowDataPacket[];
		commentCount: RowDataPacket[];
	}>;
	getRecommendById: (id: string) => Promise<{
		rows: RowDataPacket[];
	}>;
} = {
	getByName: async (name: string, offset: number, pageSize: number, orderBy: string) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;
		orderBy = getOrderBy(orderBy);

		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				`SELECT COUNT(s.shopid) AS total 
					FROM shop AS s 
					JOIN 
							shopcity AS sc ON s.shopid = sc.shopid
					JOIN
							city AS c ON c.cityid = sc.cityid 
					WHERE
							shopname LIKE ?;`,
				[likeTerm],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
				s.ShopID,
				s.ShopName,
				s.ShopBranch,
				s.ShopAddress,
				c.CityName, COALESCE(commentData.ActualCommentCount, 0) as ActualCommentCount,
				COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
				COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
				COALESCE(avgScore.AvgService, 0) as AvgService,
				COALESCE(avgScore.AvgPrice, 0) as AvgPrice
				FROM shop as s
				LEFT JOIN shopcity AS sc ON s.shopid = sc.shopid
				LEFT JOIN city AS c ON c.cityid = sc.cityid
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as ActualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				LEFT JOIN 
						(
								SELECT 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService, 
										AVG(AvgPrice) AS AvgPrice,
										shopid
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				WHERE  s.shopname like ?
				ORDER BY ${orderBy}
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

	getByCity: async (city: string, offset: number, pageSize: number, orderBy: string) => {
		orderBy = getOrderBy(orderBy);
		const connection = await initConnection();
		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				`SELECT COUNT(s.shopid) AS total FROM shopcity AS sc 
						JOIN shop AS s ON s.shopid = sc.ShopId 
						JOIN city AS c ON c.cityid = sc.cityid 
						WHERE sc.CityID = ?`,
				[city],
			),
			connection.query<RowDataPacket[]>(
				`SELECT
					s.ShopID,
					s.ShopName,
					s.ShopBranch,
					s.ShopAddress, 
					c.CityName,
					COALESCE(commentData.ActualCommentCount, 0) as ActualCommentCount,
					COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
					COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
					COALESCE(avgScore.AvgService, 0) as AvgService
					COALESCE(avgScore.AvgPrice, 0) as AvgPrice
				FROM shop AS s
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as ActualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				JOIN
						shopcity AS sc ON s.shopid = sc.ShopId
				JOIN
						city AS c ON c.cityid = sc.cityid
				LEFT JOIN 
						(
								SELECT 
										AVG(CommentTaste) AS AvgTaste, 
										AVG(CommentEnvironment) AS AvgEnvironment, 
										AVG(CommentService) AS AvgService, 
										AVG(AvgPrice) AS AvgPrice,
										shopid
								FROM shopcomment
								GROUP BY shopid
						) AS avgScore ON avgScore.shopid = s.shopid
				WHERE sc.CityID = ?
				ORDER BY ${orderBy}
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

	getByCityAndName: async (city: string, name: string, offset: number, pageSize: number, orderBy: string) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;
		orderBy = getOrderBy(orderBy);
		// promise all
		const [[total], [rows]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				`SELECT COUNT(s.shopid) AS total FROM shopcity AS sc 
				JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid 
				WHERE sc.CityID = ? AND s.ShopName LIKE ? ;`,
				[city, likeTerm],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
					s.ShopID,
					s.ShopName,
					s.ShopBranch,
					s.ShopAddress, 
					c.CityName, 
					COALESCE(commentData.ActualCommentCount, 0) as ActualCommentCount,
					COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
					COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
					COALESCE(avgScore.AvgService, 0) as AvgService
					COALESCE(avgScore.AvgPrice, 0) as AvgPrice
					FROM 
							shopcity AS sc 
					JOIN 
							shop AS s ON s.shopid = sc.ShopId 
					JOIN 
							city AS c ON c.cityid = sc.cityid
					LEFT JOIN 
						(
								SELECT shopid, COUNT(commentid) as ActualCommentCount
								FROM shopcomment
								GROUP BY shopid
						) AS commentData ON s.shopid = commentData.shopid
					LEFT JOIN 
							(
									SELECT 
											AVG(CommentTaste) AS AvgTaste, 
											AVG(CommentEnvironment) AS AvgEnvironment, 
											AVG(CommentService) AS AvgService, 
											AVG(AvgPrice) AS AvgPrice,
											shopid
									FROM shopcomment
									GROUP BY shopid
							) AS avgScore ON avgScore.shopid = s.shopid
					WHERE 
							sc.CityID = ? AND s.ShopName LIKE ? 
					ORDER BY ${orderBy}
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
		const [[info], [dishNames], [avgScore], [ratingCounts], [commentCount]] = await Promise.all([
			connection.query<RowDataPacket[]>(
				`SELECT 
						s.ShopID,
						s.ShopName,
						s.ShopBranch,
						s.ShopAddress,
						c.CityName
				FROM 
						shop AS s 
				JOIN 
						shopcity AS sc ON s.shopid = sc.shopid
				JOIN 
						city AS c ON c.cityid = sc.cityid
				WHERE 
						s.shopid = ?
				LIMIT 1;
			`,
				[id],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
						GROUP_CONCAT(d.DishName SEPARATOR ', ') AS DishNames
				FROM 
						shopdish AS sd 
				LEFT JOIN 
						dish AS d ON d.dishid = sd.dishid
				WHERE 
						sd.shopid = ?
				GROUP BY 
						sd.shopid;
				`,
				[id],
			),
			connection.query<RowDataPacket[]>(
				`
			SELECT 
					AVG(CommentTaste) AS AvgTaste, 
					AVG(CommentEnvironment) AS AvgEnvironment, 
					AVG(CommentService) AS AvgService
			FROM 
					shopcomment
			WHERE 
					shopid = ?;
			`,
				[id],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
						COALESCE(SUM(CASE WHEN CommentTaste = 0 THEN 1 ELSE 0 END), 0) AS RatingCount0,
						COALESCE(SUM(CASE WHEN CommentTaste = 1 THEN 1 ELSE 0 END), 0) AS RatingCount1,
						COALESCE(SUM(CASE WHEN CommentTaste = 2 THEN 1 ELSE 0 END), 0) AS RatingCount2,
						COALESCE(SUM(CASE WHEN CommentTaste = 3 THEN 1 ELSE 0 END), 0) AS RatingCount3,
						COALESCE(SUM(CASE WHEN CommentTaste = 4 THEN 1 ELSE 0 END), 0) AS RatingCount4,
						COALESCE(SUM(CASE WHEN CommentTaste = 5 THEN 1 ELSE 0 END), 0) AS RatingCount5
				FROM 
						shopcomment
				WHERE 
						shopid = ?;
			`,
				[id],
			),
			connection.query<RowDataPacket[]>(
				`SELECT 
						COUNT(commentid) as ActualCommentCount
				FROM 
						shopcomment
				WHERE 
						shopid = ?;
			`,
				[id],
			),
		]);
		await connection.end();
		return {
			info,
			dishNames,
			avgScore,
			ratingCounts,
			commentCount,
		};
	},

	getRecommendById: async (id: string) => {
		const connection = await initConnection();
		const [rows] = await connection.query<RowDataPacket[]>(
			`SELECT 
				s.ShopID,
				s.ShopName,
				s.ShopBranch,
				ShopAddress,
				s.AvgPrice,
				s.ShopAddress,
				c.CityName,
				COALESCE(commentData.ActualCommentCount, 0) as ActualCommentCount,
				COALESCE(avgScore.AvgTaste, 0) as AvgTaste,
				COALESCE(avgScore.AvgEnvironment, 0) as AvgEnvironment,
				COALESCE(avgScore.AvgService, 0) as AvgService
			FROM 
					shop AS s
			JOIN
					shopdish AS sd ON s.ShopID = sd.ShopID
			JOIN
					dish AS d ON sd.DishID = d.DishID
			JOIN
					shopcity AS sc ON sc.shopid = s.shopid
			JOIN
					city AS c ON c.cityid = sc.cityid
			LEFT JOIN (
					SELECT shopid, COUNT(commentid) as ActualCommentCount
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
					sc.CityID = (SELECT CityID FROM shopcity WHERE ShopID = ?)
					AND sd.DishID IN (SELECT DishID FROM shopdish WHERE ShopID = ?)
					AND s.ShopID <> ?
					AND ActualCommentCount > 0
			ORDER BY RAND()
			LIMIT 4;`,
			[id, id, id],
		);

		await connection.end();
		return {
			rows,
		};
	},
};

export default ShopService;

const getOrderBy = (orderBy: string) => {
	switch (orderBy) {
		case "rating":
			orderBy = "(AvgTaste + AvgEnvironment + AvgService) DESC";
			break;
		case "price_asc":
			orderBy = "AvgPrice ASC";
			break;
		case "price_desc":
			orderBy = "AvgPrice DESC";
			break;
		default:
			orderBy = "(AvgTaste + AvgEnvironment + AvgService) DESC";
			break;
	}
	return orderBy;
};
