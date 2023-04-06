import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../Schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewModelWithQuery } from '../DTO/User/user-view-model.dto';
import { Helpers } from '../Helpers/helpers';
import { Post, PostDocument } from '../Schemas/post.schema';
import { PostViewModelWithQuery } from '../DTO/Post/post-view-model';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    public helpers: Helpers,
  ) {}
  async getPosts(
    pageNumber = 1,
    sortBy = 'createdAt',
    pageSize = 10,
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<PostViewModelWithQuery> {
    const matchedUsersWithSkip = await this.postModel
      .find()
      .skip((pageNumber - 1) * pageSize)
      .limit(Number(pageSize))
      .sort([[sortBy,sortDirection]])
      .exec();

    const matchedPosts = await this.postModel.find().exec();
    const pagesCount = Math.ceil(matchedPosts.length / pageSize);
    return {
      pagesCount: Number(pagesCount),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount: matchedPosts.length,
      items: matchedUsersWithSkip.map(this.helpers.postMapperToView),
    };
  }
}
