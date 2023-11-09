import CityService from "~/utils/mysql/city";
export default eventHandler(async (event) => {
	const cities = await CityService.getCities();
	setResponseStatus(event, 200);
	setResponseHeaders(event, { "Content-Type": "application/json" });
	await send(event, JSON.stringify(parseCities(cities)));
	return;
});

function parseCities(cities: any) {
	return cities.map((city: any) => ({
		id: city.CityID,
		name: city.CityName,
	}));
}
