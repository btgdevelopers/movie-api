import { EnvironmentService } from "@config/env/environment.service";
import { provide } from "@config/ioc/inversify.config";
import { TYPE } from "@config/ioc/types";
import { User } from "@models/User";
import { Params } from "@schemas/Params";
import { PersistanceService } from "@services/persistance/persistance.service";
import { inject } from "inversify";
import * as jwt from 'jsonwebtoken';

@provide(TYPE.AuthService)
export class AuthService{

    constructor(
        @inject(TYPE.EnvironmentService) private environService: EnvironmentService,
        @inject(TYPE.PersistanceService) private persistanceService: PersistanceService
    ){}

    public async login(username: string, password: string): Promise<any> {
        const params: Params = await this.persistanceService.getParams();
        const token = this.createToken(username,params.jwtExpirationTime);
        return token;
    }

    private createToken(userId: string, expiresIn?: string){
        const accessToken = jwt.sign({
            id:userId,
        }, this.environService.getVariables().jwtSecret,{expiresIn});
        return accessToken;
    }

    public async validateToken(token: string){
        const userInfo: any = jwt.verify(token, this.environService.getVariables().jwtSecret);
        const user = await this.me(userInfo.id);
        return user;
    }

    public async me(username: string): Promise<User>{
        return this.persistanceService.getUser(username);
    }

}