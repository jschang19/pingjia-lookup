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
				`SELECT s.*, c.CityName, COALESCE(commentData.actualCommentCount, 0) as actualCommentCount
				FROM shop as s
				LEFT JOIN shopcity AS sc ON s.shopid = sc.shopid
				LEFT JOIN city AS c ON c.cityid = sc.cityid
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as actualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
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
				`SELECT s.*, c.CityName, COALESCE(commentData.actualCommentCount, 0) as actualCommentCount
				FROM shop AS s
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as actualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				JOIN shopcity AS sc ON s.shopid = sc.ShopId
				JOIN city AS c ON c.cityid = sc.cityid
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
				`SELECT s.*, c.CityName, COALESCE(commentData.actualCommentCount, 0) as actualCommentCount
				FROM shopcity AS sc 
				JOIN shop AS s ON s.shopid = sc.ShopId 
				JOIN city AS c ON c.cityid = sc.cityid 
				LEFT JOIN (
						SELECT shopid, COUNT(commentid) as actualCommentCount
						FROM shopcomment
						GROUP BY shopid
				) AS commentData ON s.shopid = commentData.shopid
				WHERE sc.CityID = ? AND s.ShopName LIKE ? LIMIT ?, ?`,
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
			"SELECT * FROM shop AS s JOIN shopcity AS sc ON s.shopid = sc.shopid JOIN city AS c ON c.cityid = sc.cityid WHERE s.shopid = ? LIMIT 1",
			[id],
		);
		await connection.end();
		return rows;
	},
};

export default ShopService;
