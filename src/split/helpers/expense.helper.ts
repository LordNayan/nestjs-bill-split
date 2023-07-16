import { EqualExpense } from "@split/models/expense/equal-expense.entity";
import { UnequalExpense } from "@src/split/models/expense/unequal-expense.entity";
import { Expense } from "@split/models/expense/expense.entity";
import { Split } from "@split/models/split/split.entity";
import { User } from "@split/models/user.entity";
import { ExpenseType } from "@split/enums/expense-type.enum";

export class ExpenseHelper {
  static createExpense(
    expenseType: ExpenseType,
    amount: number,
    name: string,
    paidBy: User,
    splits: Split[]
  ): Expense | null {
    switch (expenseType) {
      case ExpenseType.UNEQUAL:
        return new UnequalExpense(amount, name, paidBy, splits);
      case ExpenseType.EQUAL:
        const totalSplits = splits.length;
        const splitAmounts = this.splitValue(amount, totalSplits);
        for (let i = 0; i < splitAmounts.length; i++) {
          splits[i].setAmount(splitAmounts[i]);
        }
        return new EqualExpense(amount, name, paidBy, splits);
      default:
        return null;
    }
  }

  private static splitValue(value: number, numberOfPeople: number): number[] {
    const splitValues = [];
    let remainingAmount = value;
    const resultingAmt = (remainingAmount / numberOfPeople).toFixed(2);

    while (remainingAmount != 0) {
      if (remainingAmount < 1) {
        splitValues.pop();
        splitValues.push(+(+resultingAmt + remainingAmount).toFixed(2));
        break;
      } else {
        splitValues.push(+resultingAmt);
      }
      remainingAmount -= +resultingAmt;
    }
    return splitValues;
  }
}
