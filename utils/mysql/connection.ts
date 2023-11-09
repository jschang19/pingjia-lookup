// import mysql2
import mysql from "mysql2/promise";

// Create a function to initialize the connection
async function initializeConnection() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWD,
			database: process.env.DB_NAME,
			port: Number(process.env.DB_PORT),
		});

		return connection;
	} catch (error) {
		console.error("Database connection failed:", error);
		throw error;
	}
}

// Call the async function immediately and export the resulting promise
export default initializeConnection;
