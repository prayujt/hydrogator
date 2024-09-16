import { Sequelize } from 'sequelize';

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  NODE_ENV,
} from './vars';

export const sequelize: Sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT),
    dialect: 'postgres',
    dialectOptions: NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, // You can set this to true if the SSL certificate is authorized
      },
    } : {},
  }
);

export const disconnect = (): void => {
  sequelize.close();
};

export const sync = async (): Promise<void> => {
  await sequelize.sync();
}
