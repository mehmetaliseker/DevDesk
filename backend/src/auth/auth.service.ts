import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { UserResponse, UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService
  ) {}

  async register(dto: RegisterDto): Promise<{ user: UserResponse }> {
    const email = dto.email.toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.createUser({
      name: dto.name.trim(),
      email,
      passwordHash,
      role: Role.CUSTOMER
    });

    return { user: this.usersService.toResponse(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const safeUser = this.usersService.toResponse(user);
    const accessToken = await this.jwtService.signAsync({
      sub: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role
    });

    return {
      accessToken,
      user: safeUser
    };
  }

  async me(user: AuthenticatedUser): Promise<UserResponse> {
    return this.usersService.findById(user.id);
  }
}
