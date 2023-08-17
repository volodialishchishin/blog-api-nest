import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';

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
}
