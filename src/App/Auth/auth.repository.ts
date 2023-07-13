import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Helpers } from "../Helpers/helpers";
import { Injectable } from "@nestjs/common";
import { Token, TokenDocument } from "../../Schemas/token.schema";

Injectable();
export class AuthRepository {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    public helpers: Helpers,
  ) {}
  async findTokenByUserId(userId: string) {
    return this.tokenModel.findOne({ userId: userId });
  }

  async updateToken(userId: string, refreshToken: string) {
    return this.tokenModel.updateOne(
      { userId: userId },
      { $set: { refreshToken, lastActiveDate: new Date().toISOString() } },
    );
  }
  async createToken(token: Token) {
    const createdToken = new this.tokenModel(token);
    return await createdToken.save();
  }
}
