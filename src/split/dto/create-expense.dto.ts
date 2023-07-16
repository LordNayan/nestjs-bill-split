import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { ExpenseType } from "@split/enums/expense-type.enum";
import { Type } from "class-transformer";

export class CreateExpenseDto {
  @ApiProperty({
    description: "Type of Expense",
    example: ExpenseType.UNEQUAL,
  })
  @IsNotEmpty()
  @IsEnum(ExpenseType)
  expenseType: ExpenseType;

  @ApiProperty({
    description: "Name of Expense",
    example: "test expense",
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
  paidBy: string;

  @ApiProperty({
    description: "Total Amount",
    example: 1500,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description:
      "Its an mandatory property in case the split type is UNEQUAL. This should be equal to the number of people between whom split is happening.",
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfUsers?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SplitInfo)
  @ApiProperty({
    example: [
      {
        email: "nayan@gmail.com",
        amount: 500,
      },
      {
        email: "nayan2@gmail.com",
        amount: 500,
      },
      {
        email: "nayan3@gmail.com",
        amount: 500,
      },
    ],
  })
  splitInfo?: SplitInfo[];
}

export class SplitInfo {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class CreateExpenseResponseDto {
  message: string;
}

export class ShowBalanceDto {
  message: string;
  data: {
    trxs: string[];
    totalShare: number;
  };
}

export class ShowBalancesDto {
  message: string;
  data: {
    trxs: string[];
    totalGroupSpendings: number;
  };
}
