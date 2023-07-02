import { UserDocument } from '../Schemas/user.schema';
import { UserViewModel } from '../DTO/User/user-view-model.dto';
import { PostDocument } from '../Schemas/post.schema';
import { PostViewModel } from '../DTO/Post/post-view-model';
import { LikeInfoViewModelValues } from '../DTO/LikeInfo/like-info-view-model';
import { CommentDocument } from '../Schemas/comment.schema';
import { CommentViewModel } from '../DTO/Comment/comment-view-model';
import { BlogDocument } from '../Schemas/blog.schema';
import { BlogViewModel } from '../DTO/Blog/blog-view-model';

export class Helpers {
  public userMapperToView(user: UserDocument): UserViewModel {
    return {
      id: user._id,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      login: user.accountData.login,
    };
  }

  public postMapperToView(post: PostDocument): PostViewModel {
    return {
      id: post._id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeInfoViewModelValues.none,
        newestLikes: [],
      },
    };
  }

  public commentsMapperToView(comment: CommentDocument): CommentViewModel {
    return {
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      id: comment._id,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeInfoViewModelValues.none,
      },
    };
  }

  public blogMapperToView(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id,
      name: blog.name,
      createdAt: blog.createdAt,
      websiteUrl: blog.websiteUrl,
      description: blog.description,
      isMembership: blog.isMembership,
    };
  }
}
