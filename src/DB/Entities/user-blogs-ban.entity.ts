import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogEntity } from './blog.entity';

@Entity()
export class UserBlogsBanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  banDate: string;

  @Column({ type: 'varchar', nullable: true })
  banReason: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.bannedBlogs)
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blog) => blog.bannedUsers)
  blog: BlogEntity;
}
