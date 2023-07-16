import { User } from "@split/models/user.entity";
import { Split } from "@split/models/split/split.entity";

export class UnequalSplit extends Split {
  constructor(user: User, amount: number) {
    super(user);
    this.amount = amount;
  }
}
