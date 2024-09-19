import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService

  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { fullName, email, phoneNumber, password, confirmPassword } = createUserDto;
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        fullName,
        phoneNumber,
        email,
        password: hashedPassword

      });
      // const payload = { sub: user.email };
      // access_token: this.jwtService.sign(payload);
      await user.save();
      const userDto = {
        fullName,
        phoneNumber,
        email,
        rank: user.currentRank,
        points: user.points,
        id: user._id
      }
      return userDto;
    }
    catch (error) {
      console.error(error)
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }


  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload = { sub: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        fullName: user.fullName,
        email: user.email,
        rank: user.currentRank,
        points: user.points,
        id: user._id
        // Get other user details like Weekly, all time and current rank later
      },
    };
  }
}  
