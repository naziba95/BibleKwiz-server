import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // Provide a fallback secret for local testing
      signOptions: { expiresIn: '1d' },
    }), // Register JwtModule
    
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ], // Export UsersService if needed in other modules
})
export class UsersModule {}

