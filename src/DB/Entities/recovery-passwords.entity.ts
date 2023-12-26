import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class RecoveryPasswordsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.recoveryPasswords)
  user: UserEntity;
}
