import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.user.register')
  authRegisterUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.authRegisterUser(registerUserDto);
  }

  @MessagePattern('auth.user.login')
  authLoginUser(@Payload() data: any) {
    return '';
  }

  @MessagePattern('auth.user.verify')
  authVerifyUser(@Payload() data: any) {
    return '';
  }
}
