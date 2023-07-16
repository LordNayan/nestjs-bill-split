import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import { SplitService } from "@split/split.service";
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiParam,
} from "@nestjs/swagger";
import { Response } from "express";
import {
  CreateUserDto,
  CreateUserResponseDto,
} from "@split/dto/create-user.dto";
import { User } from "@split/models/user.entity";
import { CreateExpenseDto } from "@split/dto/create-expense.dto";

@ApiTags("split")
@Controller("api")
@ApiBearerAuth()
export class SplitController {
  constructor(private splitService: SplitService) {}

  @ApiOperation({ summary: "Add a new user." })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiOkResponse({
    status: 201,
    description: `success`,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: `Request payload is not correct`,
  })
  @Post("/user")
  createUser(
    @Body() payload: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ): CreateUserResponseDto {
    const result = this.splitService.addUser(
      new User(payload.name, payload.email)
    );
    response.status(HttpStatus.CREATED);
    return result;
  }

  @ApiOperation({ summary: "Add Expense." })
  @ApiBody({
    type: CreateExpenseDto,
  })
  @ApiOkResponse({
    status: 201,
    description: `success`,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: `Request payload is not correct`,
  })
  @Post("/expense")
  async createExpense(
    @Body() payload: CreateExpenseDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.splitService.addExpense(payload);
    response.status(HttpStatus.CREATED);
    return result;
  }

  @ApiOperation({ summary: "Show User Balance." })
  @ApiParam({
    name: "email",
    type: "String",
    required: true,
    example: "nayan@gmail.com",
  })
  @ApiOkResponse({
    status: 200,
    description: `success`,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: `Request payload is not correct`,
  })
  @Get("/user/:email/balance")
  async getBalance(
    @Param("email") email: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.splitService.showBalance(email);
    response.status(HttpStatus.OK);
    return result;
  }

  @ApiOperation({ summary: "Show balances for all users." })
  @ApiOkResponse({
    status: 200,
    description: `success`,
  })
  @ApiBadRequestResponse({
    status: 400,
    description: `Request payload is not correct`,
  })
  @Get("/user/balances")
  async getBalances(@Res({ passthrough: true }) response: Response) {
    const result = await this.splitService.showBalances();
    response.status(HttpStatus.OK);
    return result;
  }
}
