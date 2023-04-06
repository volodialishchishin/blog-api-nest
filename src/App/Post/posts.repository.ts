import { PostViewModel } from '../../DTO/Post/post-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../Schemas/post.schema';
import { Model } from 'mongoose';
import { Helpers } from '../../Helpers/helpers';
import {Injectable} from "@nestjs/common";
Injectable()
export class PostsRepository {
  constructor(
      @InjectModel(Post.name) private postModel: Model<PostDocument>,
    public helpers: Helpers,
  ) {}
  async getPosts(): Promise<PostViewModel[]> {
    const result = await this.postModel.find({}).exec();
    return result.map(this.helpers.postMapperToView);
  }

  async createPost(post: Post) {
    const createdPost = new this.postModel(post);
    const newPost = await createdPost.save();
    console.log(newPost)
    return this.helpers.postMapperToView(newPost);
  }
  async updatePost(
    blogId: string,
    title: string,
    content: string,
    shortDescription: string,
    id: string,
  ): Promise<number> {
    const result = await this.postModel.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          shortDescription: shortDescription,
          content: content,
          blogId: blogId,
        },
      },
    );
    return result.modifiedCount;
  }
  async deletePost(id: string): Promise<number> {
    const result = await this.postModel.deleteOne({ _id: id });
    return result.deletedCount;
  }
  async getPost(id: string): Promise<PostViewModel> {
    const result = await this.postModel.findOne({ _id:id }).exec();
    return result ? this.helpers.postMapperToView(result):null
  }
}
