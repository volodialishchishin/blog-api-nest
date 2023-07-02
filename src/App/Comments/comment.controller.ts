import { Body, Controller, Delete, Get, Param, Put, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { CommentService } from './comment.service';
import { AuthService } from "../Auth/auth.service";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService, private readonly authService:AuthService) {}

  @Get(':id')
  async getComment(@Param() params, @Res() response: Response, @Req() request:Request) {
    const authToken = request.headers.authorization?.split(' ')[1] || ''
    const user = this.authService.getUserIdByToken(authToken)
    let result = await this.commentService.getComment(params.id, user?.user)
    result ? response.status(200).json(result) : response.sendStatus(404)
  }

  @Delete(':id')
  async deleteComment(@Param() params, @Res() response: Response, @Req() request:Request) {
    let comment = await this.commentService.getComment(params.id, request.context.user.userId)
    if (!comment) {
      response.sendStatus(404)
      return
    }
    if (comment.commentatorInfo.userId !== request.context.user.userId) {
      response.sendStatus(403)
      return
    }

    let deleteStatus = await this.commentService.deleteComment(request.params.commentId)
    if (deleteStatus) {
      response.sendStatus(204)
      return
    }
  }
  @Put(':id')
  async updateComment(@Param() params, @Res() response: Response, @Req() request:Request,@Body() commentUpdateDto:{content:string}) {
    let comment = await this.commentService.getComment(params.id, request.context.user.userId)
    if (!comment) {
      response.sendStatus(404)
      return
    }
    if (comment.commentatorInfo.userId !== request.context.user.userId) {
      response.sendStatus(403)
      return
    }
    let updateStatus = await this.commentService.updateComment(params.id, commentUpdateDto.content)
    if (updateStatus) {
      response.sendStatus(204)
      return
    }
  }

  @Put(':id/like-status')
  async updateLikeStatus(@Param() params, @Res() response: Response, @Req() request:Request, @Body() likeUpdateDto:{likeStatus: LikeInfoViewModelValues}) {

    let result = await this.commentService.updateLikeStatus(likeUpdateDto.likeStatus, request.context.user.userId, params.id, request.context.user.login)
    if (result){
      response.sendStatus(204)
    }else{
      response.sendStatus(404)
    }
  }
}
