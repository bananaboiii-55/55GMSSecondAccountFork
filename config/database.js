import { Sequelize } from "sequelize";
import "dotenv/config";

// Ensure the connection string is provided so Sequelize doesn't
// choke on an undefined value and throw an unrelated `validateString`
// error in `node:url`. This gives a clearer message early.
const connectionString = process.env.POSTGRES_URL;

let sequelize;
if (connectionString) {
  sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // falling back to sqlite makes it trivial to run the project locally
  // without a PostgreSQL server.  The file will be created in the
  // project root if it doesn't already exist.
  console.warn(
    "POSTGRES_URL not set; falling back to sqlite database './dev.sqlite'."
  );
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./dev.sqlite",
    logging: false,
  });
}

export default sequelize;
