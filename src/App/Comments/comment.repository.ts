import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../Schemas/user.schema';
import { Model } from 'mongoose';
import { Helpers } from '../../Helpers/helpers';
import { UserViewModel } from '../../DTO/User/user-view-model.dto';
import { Comment, CommentDocument } from '../../Schemas/comment.schema';
import { CommentViewModel } from '../../DTO/Comment/comment-view-model';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    public helpers: Helpers,
  ) {}
  async createComment(comment: Comment): Promise<CommentViewModel> {
    const createdComment = new this.commentModel(comment);
    const newUser = await createdComment.save();
    return this.helpers.commentsMapperToView(newUser);
  }

  async getComment(id: string) {
    const blog = await this.commentModel.findOne({ _id: id }).exec();
    return this.helpers.commentsMapperToView(blog);
  }
}
