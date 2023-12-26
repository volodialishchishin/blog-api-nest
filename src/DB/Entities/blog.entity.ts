import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserBlogsBanEntity } from './user-blogs-ban.entity';
import { PostEntity } from './post.entity';
import { UserEntity } from './user.entity';

@Entity()
export class BlogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
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

  @ManyToOne(() => UserEntity, (user) => user.blogs)
  user: UserEntity;

  @OneToMany(() => UserBlogsBanEntity, (ban) => ban.blog)
  bannedUsers: UserBlogsBanEntity[];

  @OneToMany(() => PostEntity, (post) => post.blog)
  posts: PostEntity[];
}
