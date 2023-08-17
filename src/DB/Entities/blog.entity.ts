import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Prop } from '@nestjs/mongoose';

@Entity()
export class BlogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;
  @Column({ type: 'varchar' })
  description: string;
  @Column({ type: 'varchar' })
  websiteUrl: string;
  @Column({ type: 'varchar' })
  createdAt: string;
  @Column({ type: 'boolean' })
  isMembership: boolean;
  @Column({ type: 'boolean' })
  isBanned: boolean;
  @Column({ type: 'varchar', nullable: true })
  banDate: string;
  @Column({ type: 'uuid', nullable: true })
  userId: string;
}
