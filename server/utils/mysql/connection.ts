// import mysql2
import mysql from "mysql2/promise";

// Create a function to initialize the connection
async function initializeConnection() {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWD,
			database: process.env.DATABASE_NAME,
			port: Number(process.env.DATABASE_PORT),
		});

		return connection;
	} catch (error) {
		console.error("Database connection failed:", error);
		throw error;
	}
}

// Call the async function immediately and export the resulting promise
export default initializeConnection;
