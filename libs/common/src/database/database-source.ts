import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

export const DatabaseSource: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.DB_HOST}`,
  port: +process.env.DB_PORT,
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`,
  entities: ['dist/**/*.model{.ts,.js}'],
  migrations: ['dist/libs/common/src/database/migrations/*{.ts,.js}'],
  synchronize: false,
};

const dataSource = new DataSource(DatabaseSource);

export default dataSource;
