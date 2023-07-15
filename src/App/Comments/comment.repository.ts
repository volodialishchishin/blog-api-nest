import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { Comment, CommentDocument } from '../../Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';
import { Like, LikeDocument } from "../../Schemas/like.schema";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";
import { LikeInfoModel } from "../../DTO/LikeInfo/like-info-model";

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,

    public helpers: Helpers,
  ) {}
  async updateComment(id: string, content: string): Promise<boolean> {
    let result = await this.commentModel.updateOne(
      {_id: id},
      {
        $set: {
          content: content,
        }
      }
    );
    return result.matchedCount === 1
  }
  async deleteComment(id:string):Promise<boolean>{
    let result = await this.commentModel.deleteOne(
      { _id : id }
    ).exec();
    return result.deletedCount === 1
  }
  async createComment(comment:Comment): Promise<CommentViewModel> {
    const createdComment = new this.commentModel(comment);
    const newComment = await createdComment.save();
    return this.helpers.commentsMapperToView(newComment);
  }

  async getComment(id: string, userId:string) {
    const comment = await this.commentModel.findOne({_id:id})
    if (comment){
      let commentToView  = await this.helpers.commentsMapperToView(comment);

      if (!userId){
        return commentToView
      }
      let likeStatus = await this.likeModel.findOne({userId,entityId:id})
      if (likeStatus){
        commentToView.likesInfo.myStatus = likeStatus?.status || LikeInfoViewModelValues.none
      }
      return commentToView
    }
    else{
      return undefined
    }
  }
  async updateLikeStatus(likeStatus: LikeInfoViewModelValues, userId: string, commentId: string, login:string) {
    let comment = await this.commentModel.findOne({_id:commentId})
    if (!comment){
      return false
    }
    const like = await this.likeModel.findOne({entityId:commentId,userId})
    if (!like){
      const status:LikeInfoModel = {
        entityId:commentId,
        userId,
        status: likeStatus,
        dateAdded: new Date(),
        userLogin:login
      }
      let like = await this.likeModel.create(status)
      await like.save()
    }
    else{
      if (likeStatus === LikeInfoViewModelValues.none){
        await this.likeModel.deleteOne({userId:like.userId,entityId:like.entityId})
      }else{
        await this.likeModel.updateOne({entityId:commentId,userId},{$set:{status:likeStatus}})
      }
    }
    return true
  }
}
