import dotenv from "dotenv";
dotenv.config();

const useEnvVariable = process.env.DATABASE_URL ? "DATABASE_URL" : undefined;

export default {
  development: {
    use_env_variable: useEnvVariable,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  },

  test: {
    use_env_variable: useEnvVariable,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  },

  production: {
    use_env_variable: useEnvVariable,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres"
  }
};