import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { Comment } from '../../Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';

@Injectable()
export class CommentService {
  constructor(private commentRep: CommentRepository) {}

  async createComment(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentViewModel> {
    const resolvedComment: Comment = {
      content,
      userId,
      userLogin,
      createdAt: new Date().toISOString(),
      postId,
      isUserBanned: false,
    };
    return await this.commentRep.createComment(resolvedComment);
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
  async updateLikeStatus(
    likeStatus,
    userId: string,
    commentId: string,
    login: string,
  ) {
    return this.commentRep.updateLikeStatus(
      likeStatus,
      userId,
      commentId,
      login,
    );
  }
}
