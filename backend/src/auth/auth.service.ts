import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.type';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) return null;

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      federationId: user.federationId || undefined,
      clubId: user.clubId || undefined,
      labId: user.labId || undefined,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    // refresh token pode ser implementado depois

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        federationId: user.federationId,
        clubId: user.clubId,
        labId: user.labId,
      },
    };
  }
}
