import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserBlogsBanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable:true })
  banDate: string;
  @Column({ type: 'varchar', nullable:true })
  banReason: string;
  @Column({ type: 'uuid' })
  blogId: string;
  @Column({ type: 'uuid' })
  userId: string;
}
