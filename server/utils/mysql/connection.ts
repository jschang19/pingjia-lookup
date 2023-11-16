// import mysql2
import mysql from "mysql2/promise";

// Create a function to initialize the connection
async function initializeConnection() {
	try {
		if (!process.env.DATABASE_URL) {
			throw new Error("DATABASE_URL not found");
		}

		const connection = await mysql.createConnection(process.env.DATABASE_URL);

		return connection;
	} catch (error) {
		console.error("Database connection failed:", error);
		throw error;
	}
}

// Call the async function immediately and export the resulting promise
export default initializeConnection;
