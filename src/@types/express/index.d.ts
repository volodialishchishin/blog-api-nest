import * as jwt from "jsonwebtoken";
declare global{
    declare namespace Express{
        export interface Request{
            context:{
                user:{
                    userId:string,
                    login:string,
                    email:string
                }
            }
        }
    }
}
declare module 'jsonwebtoken' {
    export interface UserIDJwtPayload extends jwt.JwtPayload {
        userId: string
        deviceId: string
    }
}
