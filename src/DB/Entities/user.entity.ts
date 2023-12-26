import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BlogEntity } from './blog.entity';
import { CommentEntity } from './comment.entity';
import { UserBlogsBanEntity } from './user-blogs-ban.entity';
import { LikeEntity } from './like.entity';
import { SessionEntity } from './session.entity';
import { RecoveryPasswordsEntity } from './recovery-passwords.entity';

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

  @Column({ type: 'varchar', nullable: true })
  banDate: string;

  @Column({ type: 'varchar', nullable: true })
  banReason: string;

  @OneToMany(() => BlogEntity, (blog) => blog.user)
  blogs: BlogEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @OneToMany(() => UserBlogsBanEntity, (ban) => ban.user)
  bannedBlogs: UserBlogsBanEntity[];

  @OneToMany(() => LikeEntity, (like) => like.user)
  likes: LikeEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];
  @OneToMany(
    () => RecoveryPasswordsEntity,
    (recoveryPasswords) => recoveryPasswords.user,
  )
  recoveryPasswords: RecoveryPasswordsEntity[];
}
