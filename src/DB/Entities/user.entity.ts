import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  passwordSalt: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'varchar' })
  emailConfirmationCode: string;

  @Column({ type: 'varchar' })
  emailConfirmationDate: string;

  @Column({ type: 'boolean' })
  isEmailConfirmed: boolean;

  @Column({ type: 'boolean' })
  isBanned: boolean;

  @Column({ type: 'varchar', nullable:true })
  banDate: string;

  @Column({ type: 'varchar', nullable:true })
  banReason: string;
}
