
import { IsEnum, IsNotEmpty } from "class-validator";
import { LikeInfoViewModelValues } from "./like-info-view-model";


export class LikeInputModel {
  @IsEnum(LikeInfoViewModelValues)
  @IsNotEmpty()
  likeStatus: string;
}
