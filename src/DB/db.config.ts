import { DataSource } from 'typeorm';
import { UserEntity } from './Entities/user.entity';
import { SessionEntity } from './Entities/session.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'ep-aged-hill-14839329.us-east-2.aws.neon.tech',
        port: 3306,
        username: 'lishchishin.volodya',
        password: 'PZ5hC2HSUonB',
        database: 'neondb',
        entities: [UserEntity, SessionEntity],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
