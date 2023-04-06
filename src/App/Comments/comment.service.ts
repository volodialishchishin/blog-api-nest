import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentInputModel } from '../../DTO/Comment/comment-input-model';
import { Comment } from '../../Schemas/comment.schema';
import { LikeType } from '../../Types/Like/like.type';

@Injectable()
export class CommentService {
  constructor(private commentRep: CommentRepository) {}

  async createUser(comment: CommentInputModel) {
    const resolvedUser: Comment = {
      ...comment,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        userId: 'string',
        userLogin: 'string',
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeType.none,
      },
    };
    return this.commentRep.createComment(resolvedUser);
  }

  getComment(id: string) {
    return this.commentRep.getComment(id);
  }
}
