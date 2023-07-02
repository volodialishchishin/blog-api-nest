import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CommentInputModel } from '../../DTO/Comment/comment-input-model';
import { Comment } from '../../Schemas/comment.schema';
import { LikeType } from '../../@types/Like/like.type';
import { CommentViewModel } from "../../DTO/Comment/comment-view-model";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";

@Injectable()
export class CommentService {
  constructor(private commentRep: CommentRepository) {}

  async createComment(postId:string,content:string,userId:string,userLogin:string) : Promise<CommentViewModel> {
    const resolvedComment = {
      content,
      userId,
      userLogin,
      createdAt: new Date(),
      postId,
    }
    let result = await this.commentRep.createComment(resolvedComment)
    return result

  }

  async getComment(id, userId:string) {
    let comment = await this.commentRep.getComment(id, userId)
    return comment
  }

  async updateComment(id:string,content:string): Promise<boolean> {
    return  this.commentRep.updateComment(id,content)
  }
  async deleteComment(id:string): Promise<boolean> {
    return  this.commentRep.deleteComment(id)
  }
  async updateLikeStatus(likeStatus: LikeInfoViewModelValues, userId: string, commentId: string, login:string) {
    return this.commentRep.updateLikeStatus(likeStatus,userId,commentId,login)
  }
}
