import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

import configData from '../config/config.js';
const config = configData[env];

const db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable],
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Only load files ending with .model.js
const files = fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (
      file !== basename &&
      file.endsWith('.model.js') &&
      !file.includes('.test.js')
    );
  });

for (const file of files) {
  const modelFilePath = path.join(__dirname, file);
  const modelUrl = pathToFileURL(modelFilePath).href;
  const modelModule = await import(modelUrl);
  const model = modelModule.default(
    sequelize,
    Sequelize.DataTypes
  );
  db[model.name] = model;
}

// Associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize, Sequelize };
export default db;