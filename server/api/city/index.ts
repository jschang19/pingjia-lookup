import { RowDataPacket } from "mysql2";
import CityService from "@/server/utils/mysql/city";
interface City {
	id: string;
	name: string;
}

export default eventHandler(async (event) => {
	const cities = await CityService.getCities();
	setResponseStatus(event, 200);
	setResponseHeaders(event, { "Content-Type": "application/json" });
	await send(event, JSON.stringify(parseCities(cities)));
});

function parseCities(cities: RowDataPacket[]): City[] {
	return cities.map((city: RowDataPacket) => ({
		id: city.CityID,
		name: city.CityName,
	}));
}
