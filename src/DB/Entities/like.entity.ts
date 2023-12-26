import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { UserEntity } from './user.entity';

@Entity()
export class LikeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: ['None', 'Like', 'Dislike'] })
  status: LikeInfoViewModelValues;

  @ManyToOne(() => UserEntity, (user) => user.likes)
  user: UserEntity;
}
