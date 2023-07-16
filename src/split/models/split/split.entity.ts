import { User } from "@split/models/user.entity";

export abstract class Split {
  private user: User;
  amount: number;

  constructor(user: User) {
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }

  setUser(user: User): void {
    this.user = user;
  }

  getAmount(): number {
    return this.amount;
  }

  setAmount(amount: number): void {
    this.amount = amount;
  }
}
