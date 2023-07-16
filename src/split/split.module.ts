import { Module } from "@nestjs/common";
import { SplitController } from "@split/split.controller";
import { SplitService } from "@split/split.service";
import { ExpenseHelper } from "@split/helpers/expense.helper";

@Module({
  controllers: [SplitController],
  providers: [SplitService, ExpenseHelper],
})
export class SplitModule {}
