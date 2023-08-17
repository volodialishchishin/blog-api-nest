import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  content: string;
  @Column({ type: 'varchar' })
  createdAt: string;
  @Column({ type: 'varchar' })
  postId: string;
  @Column({ type: 'varchar' })
  userId: string;
}