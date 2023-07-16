import { UnequalSplit } from "@split/models/split/unequal-split.entity";
import { Split } from "@split/models/split/split.entity";
import { User } from "@split/models/user.entity";
import { Expense } from "@split/models/expense/expense.entity";

export class UnequalExpense extends Expense {
  constructor(amount: number, name: string, paidBy: User, splits: Split[]) {
    super(amount, name, paidBy, splits);
  }

  validate(): boolean {
    for (const split of this.getSplits()) {
      if (!(split instanceof UnequalSplit)) {
        return false;
      }
    }

    const totalAmount = this.getAmount();
    let sumSplitAmount = 0;
    for (const split of this.getSplits()) {
      const unequalSplit = split as UnequalSplit;
      sumSplitAmount = +(sumSplitAmount + unequalSplit.getAmount()).toFixed(2);
    }

    if (totalAmount !== sumSplitAmount) {
      return false;
    }

    return true;
  }
}
