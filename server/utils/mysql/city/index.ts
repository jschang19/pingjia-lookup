import initConnection from "@/server/utils/mysql/connection";

const CityService: {
	getCities: () => Promise<any>;
	getCityByID: (id: string) => Promise<any>;
} = {
	getCities: async () => {
		const connection = await initConnection();
		const [rows] = await connection.query("SELECT * FROM city");
		return rows;
	},
	getCityByID: async (id: string) => {
		const connection = await initConnection();
		const [rows] = await connection.query("SELECT * FROM city WHERE cityid = ?", [id]);
		return rows;
	},
};

export default CityService;
