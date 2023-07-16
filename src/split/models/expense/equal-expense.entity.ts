import { EqualSplit } from "@split/models/split/equal-split.entity";
import { Split } from "@split/models/split/split.entity";
import { User } from "@split/models/user.entity";
import { Expense } from "@split/models/expense/expense.entity";

export class EqualExpense extends Expense {
  constructor(amount: number, name: string, paidBy: User, splits: Split[]) {
    super(amount, name, paidBy, splits);
  }

  validate(): boolean {
    for (const split of this.getSplits()) {
      if (!(split instanceof EqualSplit)) {
        return false;
      }
    }

    return true;
  }
}
