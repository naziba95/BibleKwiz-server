import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      if (!user) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'An error occurred'

        };
      }
      // Return the created user details
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      // Handle errors and return an appropriate response
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Failed to create user',
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    try {
      const user = await this.usersService.login(email, password);
      if (!user) {
        throw new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED);
      }
      // Return the user details and access token
      return {
        statusCode: HttpStatus.OK,
        message: 'User logged in successfully',
        data: {
          user: user.user,
          access_token: user.access_token,
        },
      };
    } catch (error) {
      // Handle errors and return an appropriate response
      console.log(error);
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
