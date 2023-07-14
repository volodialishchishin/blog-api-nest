import { Controller, Delete, Get, Injectable, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { securityService } from "./security.service";

@Controller('devices')
export class SecurityController{

  constructor(private readonly securityService:securityService ) {
  }
  @Get()
  async getSessions(@Res() response:Response, @Req() request: Request ){
    try {
      const {refreshToken} = request.cookies;
      let sessions = await this.securityService.getSessions(refreshToken)
      response.status(200).json(sessions)
    } catch (e) {
      response.sendStatus(401)
    }
  }

  @Delete()
  async deleteSessions(@Res() response:Response, @Req() request: Request){
    const {refreshToken} = request.cookies;
    try {
      let deleteResult = await this.securityService.deleteSessions(refreshToken)
      if (deleteResult.deletedCount) {
        response.sendStatus(204)
      } else {
        response.sendStatus(401)
      }

    } catch (e) {
      response.sendStatus(401)
    }
  }

  @Delete(':id')
  async deleteSession(@Res() response:Response, @Req() request: Request, @Param() params){
    const {refreshToken} = request.cookies;
    try {
      await this.securityService.deleteSession(refreshToken, request.params.id)
      response.sendStatus(204)

    } catch (e:any) {
      if (e.message === '403'){
        response.sendStatus(403)
      }
      else if (e.message === '404'){
        response.sendStatus(404)
      }
      else {
        response.sendStatus(401)
      }
    }
  }

}

