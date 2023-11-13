import { RowDataPacket } from "mysql2/promise";
import initConnection from "@/server/utils/mysql/connection";

const CityService: {
	getCities: () => Promise<RowDataPacket[]>;
	getCityByID: (id: string) => Promise<RowDataPacket[]>;
} = {
	getCities: async () => {
		const connection = await initConnection();
		const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM city");
		return rows;
	},
	getCityByID: async (id: string) => {
		const connection = await initConnection();
		const [rows] = await connection.query<RowDataPacket[]>("SELECT * FROM city WHERE cityid = ?", [id]);
		return rows;
	},
};

export default CityService;
