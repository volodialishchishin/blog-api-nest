import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';

@Entity()
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;
  @Column({ type: 'varchar' })
  refreshToken: string;
  @Column({ type: 'varchar' })
  ip: string;
  @Column({ type: 'varchar' })
  title: string;
  @Column({ type: 'varchar' })
  lastActiveDate: string;
  @Column({ type: 'varchar' })
  deviceId: string;
}
