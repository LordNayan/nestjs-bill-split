import { Split } from "@split/models/split/split.entity";
import { User } from "@split/models/user.entity";

export abstract class Expense {
  private id: string;
  private amount: number;
  private name: string;
  private paidBy: User;
  private splits: Split[];

  constructor(amount: number, name: string, paidBy: User, splits: Split[]) {
    this.amount = amount;
    this.name = name;
    this.paidBy = paidBy;
    this.splits = splits;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }

  getAmount(): number {
    return this.amount;
  }

  setAmount(amount: number): void {
    this.amount = amount;
  }

  getPaidBy(): User {
    return this.paidBy;
  }

  setPaidBy(paidBy: User): void {
    this.paidBy = paidBy;
  }

  getSplits(): Split[] {
    return this.splits;
  }

  setSplits(splits: Split[]): void {
    this.splits = splits;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  abstract validate(): boolean;
}
