import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Payload, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async signToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async authRegisterUser(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto;
    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: 'token',
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: 'Failed to register user',
      });
    }
  }

  async authLoginUser(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) throw new RpcException('Email or Password incorrect');

      if (!(await bcrypt.compare(password, user.password)))
        throw new RpcException('Email or Password incorrect');

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signToken(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
