import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../../DB/Entities/comment.entity';
import { Helpers } from '../Helpers/helpers';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { LikeEntity } from '../../DB/Entities/like.entity';
import { UserEntity } from '../../DB/Entities/user.entity';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    public helpers: Helpers,
  ) {}

  async updateComment(id: string, content: string): Promise<boolean> {
    const updateResult = await this.commentRepository.update(id, { content });
    return updateResult.affected > 0;
  }

  async deleteComment(id: string): Promise<boolean> {
    const deleteResult = await this.commentRepository.delete(id);
    return deleteResult.affected > 0;
  }

  async createComment(commentData): Promise<CommentViewModel> {
    const newComment = this.commentRepository.create(commentData);
    const savedComment = await this.commentRepository.save(newComment);
    const user = await this.userRepository.findOne({
      where: { id: commentData.userId },
    });
    return this.helpers.commentsMapperToViewSql({
      ...savedComment[0],
      login: user?.login,
      likesCount: 0,
      disLikesCount: 0,
    });
  }

  async getComment(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    const likesCount = await this.likeRepository.count({
      where: { entityId: id, status: LikeInfoViewModelValues.like },
    });
    const dislikeCount = await this.likeRepository.count({
      where: { entityId: id, status: LikeInfoViewModelValues.dislike },
    });
    if (comment) {
      const commentToView = await this.helpers.commentsMapperToViewSql({
        ...comment[0],
        disLikesCount: dislikeCount,
        likesCount: likesCount,
      });
      const likeStatus = await this.likeRepository.findOne({
        where: { userId, entityId: id },
      });
      if (likeStatus) {
        commentToView.likesInfo.myStatus = likeStatus.status;
      }
      return commentToView;
    }
    return undefined;
  }

  async updateLikeStatus(
    likeStatus: LikeInfoViewModelValues,
    userId: string,
    commentId: string,
  ) {
    const like = await this.likeRepository.findOne({
      where: { entityId: commentId, userId },
    });
    if (!like) {
      await this.likeRepository.save({
        entityId: commentId,
        userId,
        status: likeStatus,
        createdAt: new Date().toISOString(),
      });
      return true;
    } else {
      if (likeStatus === LikeInfoViewModelValues.none) {
        await this.likeRepository.delete({ entityId: commentId, userId });
      } else {
        await this.likeRepository.update(
          { entityId: commentId, userId },
          { status: likeStatus },
        );
      }
      return true;
    }
  }
}
