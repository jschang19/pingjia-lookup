import initConnection from "@/utils/mysql/connection";

const ShopService: {
	getByName: (
		name: string,
		current: number,
		limit: number,
	) => Promise<{
		total: number;
		rows: any[] | any;
	}>;
	getByCity: (
		city: string,
		current: number,
		limit: number,
	) => Promise<{
		total: number;
		rows: any[] | any;
	}>;
	getByCityAndName: (
		city: string,
		name: string,
		current: number,
		limit: number,
	) => Promise<{
		total: number;
		rows: any[] | any;
	}>;
} = {
	getByName: async (name: string, current: number, limit: number) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;
		const [[total], [rows]] = await Promise.all([
			connection.query(
				"SELECT COUNT(*) AS total FROM shop AS s JOIN shopcity AS sc ON s.shopid = sc.shopid JOIN city AS c ON c.cityid = sc.cityid  WHERE `ShopName` LIKE ?",
				[likeTerm],
			),
			connection.query(
				"SELECT * FROM shop AS s JOIN shopcity AS sc ON s.shopid = sc.shopid JOIN city AS c ON c.cityid = sc.cityid  WHERE `ShopName` LIKE ? ORDER BY s.shopid LIMIT ?, ?",
				[likeTerm, current, limit],
			),
		]);
		const totalRows = ((total as any)[0] as any).total;
		await connection.end();
		return {
			total: totalRows,
			rows: rows,
		};
	},

	getByCity: async (city: string, current: number, limit: number) => {
		const connection = await initConnection();
		// const [rows] = await connection.query(
		// 	"SELECT * FROM `shopcity` AS sc JOIN shop AS s on s.ShopID = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ? LIMIT ?, ?",
		// 	[city, current, limit],
		// );
		// return rows;

		const [[total], [rows]] = await Promise.all([
			connection.query(
				"SELECT COUNT(*) AS total FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ?",
				[city],
			),
			connection.query(
				"SELECT * FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ? ORDER BY s.shopid LIMIT ?, ?",
				[city, current, limit],
			),
		]);

		const totalRows = ((total as any)[0] as any).total;
		await connection.end();
		return {
			total: totalRows,
			rows: rows,
		};
	},

	getByCityAndName: async (city: string, name: string, current: number, limit: number) => {
		const connection = await initConnection();
		const likeTerm = `%${name}%`;

		// promise all
		const [[total], [rows]] = await Promise.all([
			connection.query(
				"SELECT COUNT(*) AS total FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ? AND s.ShopName LIKE ?",
				[city, likeTerm],
			),
			connection.query(
				"SELECT * FROM shopcity AS sc JOIN shop AS s ON s.shopid = sc.ShopId JOIN city AS c ON c.cityid = sc.cityid WHERE sc.CityID = ? AND s.ShopName LIKE ? LIMIT ?, ?",
				[city, likeTerm, current, limit],
			),
		]);
		await connection.end();
		return {
			total: ((total as any)[0] as any).total,
			rows: rows,
		};
	},
};

export default ShopService;
