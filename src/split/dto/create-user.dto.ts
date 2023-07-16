import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { User } from "@split/models/user.entity";

export class CreateUserDto {
  @ApiProperty({
    description: "Name of User",
    example: "Nayan",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "email",
    example: "nayan@gmail.com",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class CreateUserResponseDto {
  message: string;
  data: User;
}
