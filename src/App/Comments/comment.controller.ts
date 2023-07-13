import { Body, Controller, Delete, Get, Param, Put, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { CommentService } from './comment.service';
import { AuthService } from "../Auth/auth.service";
import { LikeInfoViewModelValues } from "../../DTO/LikeInfo/like-info-view-model";
import { JwtAuthGuard } from "../Auth/Guards/jwt.auth.guard";

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService, private readonly authService:AuthService) {}

  @Get(':id')
  async getComment(@Param() params, @Res() response: Response, @Req() request:Request) {
    const authToken = request.headers.authorization?.split(' ')[1] || ''
    const user = await this.authService.getUserIdByToken(authToken)
    let result = await this.commentService.getComment(params.id, user?.user)
    result ? response.status(200).json(result) : response.sendStatus(404)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param() params, @Res() response: Response, @Req() request:Request) {
    const { user = {} } = request
    let comment = await this.commentService.getComment(params.id, request.user.userInfo.userId)
    if (!comment) {
      response.sendStatus(404)
      return
    }
    if (comment.commentatorInfo.userId !== request.user.userInfo.userId) {
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
  @UseGuards(JwtAuthGuard)
  async updateComment(@Param() params, @Res() response: Response, @Req() request:Request,@Body() commentUpdateDto:{content:string}) {
    let comment = await this.commentService.getComment(params.id, request.user.userInfo.userId)
    if (!comment) {
      response.sendStatus(404)
      return
    }
    if (comment.commentatorInfo.userId !== request.user.userInfo.userId) {
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
  @UseGuards(JwtAuthGuard)
  async updateLikeStatus(@Param() params, @Res() response: Response, @Req() request:Request, @Body() likeUpdateDto:{likeStatus: LikeInfoViewModelValues}) {
    console.log(likeUpdateDto.likeStatus, request.user.userInfo.userId, params.id, request.user.userInfo.login);
    let result = await this.commentService.updateLikeStatus(likeUpdateDto.likeStatus, request.user.userInfo.userId, params.id, request.user.userInfo.login)
    if (result){
      response.sendStatus(204)
    }else{
      response.sendStatus(404)
    }
  }
}
