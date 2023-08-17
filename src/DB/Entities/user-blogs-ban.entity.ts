import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBlogsBanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  banDate: string;
  @Column({ type: 'varchar' })
  banReason: string;
  @Column({ type: 'uuid' })
  blogId: string;
  @Column({ type: 'uuid' })
  userId: string;
}
