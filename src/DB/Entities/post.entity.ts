import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;
  @Column({ type: 'varchar' })
  shortDescription: string;
  @Column({ type: 'varchar' })
  content: string;
  @Column({ type: 'varchar' })
  createdAt: string;
  @Column({ type: 'uuid' })
  blogId: string;
}
