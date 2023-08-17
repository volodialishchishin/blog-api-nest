import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RecoveryPasswordsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar' })
  code: string;
  @Column({ type: 'varchar' })
  userId: string;
}
