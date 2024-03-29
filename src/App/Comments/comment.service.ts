import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { Comment } from '../../DB/Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { LikeInfoViewModelValues } from '../../DTO/LikeInfo/like-info-view-model';
import { PostsRepository } from '../Post/posts.repository';
import { UserRepository } from '../Users/user.repository';
import { BlogRepository } from '../Blog/blog.repository';

@Injectable()
export class CommentService {
  constructor(
    private commentRep: CommentRepository,
    private postRep: PostsRepository,
    private userRep: UserRepository,
    private blogRep: BlogRepository,
  ) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ) {
    const resolvedComment = {
      content,
      userId,
      userLogin,
      createdAt: new Date().toISOString(),
      postId,
      isUserBanned: false,
    };

    const createdComment = await this.commentRep.createComment(resolvedComment);

    createdComment!.likesInfo = {
      myStatus: LikeInfoViewModelValues.none,
      dislikesCount: 0,
      likesCount: 0,
    };
    return createdComment;
  }

  async getComment(id, userId: string) {
    return await this.commentRep.getComment(id, userId);
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    return this.commentRep.updateComment(id, content);
  }
  async deleteComment(id: string): Promise<boolean> {
    return this.commentRep.deleteComment(id);
  }
  async updateLikeStatus(likeStatus, userId: string, commentId: string) {
    return this.commentRep.updateLikeStatus(likeStatus, userId, commentId);
  }
  async checkIfUserBanned(userId: string, postId: string) {
    const userBanStatus = await this.userRep.isUserBanned(userId, postId);
    console.log(userBanStatus);
    return userBanStatus;
  }
}
