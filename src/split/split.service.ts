import { ExpenseHelper } from "@split/helpers/expense.helper";
import { User } from "@split/models/user.entity";
import { Expense } from "@split/models/expense/expense.entity";
import { Errors } from "@src/common/enums/error.enum";
import { BadRequestException } from "@nestjs/common";
import { Split } from "@split/models/split/split.entity";
import { ExpenseType } from "@split/enums/expense-type.enum";
import { EqualSplit } from "@split/models/split/equal-split.entity";
import { UnequalSplit } from "@split/models/split/unequal-split.entity";
import {
  CreateExpenseDto,
  CreateExpenseResponseDto,
  ShowBalanceDto,
  ShowBalancesDto,
  SplitInfo,
} from "@split/dto/create-expense.dto";
import { CreateUserResponseDto } from "@split/dto/create-user.dto";
import { ErrorResponse, SuccessResponse } from "@src/common/dto/response.dto";

export class SplitService {
  private expenses: Expense[];
  private userMap: Map<string, User>;
  private balanceSheet: Map<string, Map<string, number>>;
  private totalGroupSpendings: number;

  constructor() {
    this.expenses = [];
    this.userMap = new Map<string, User>();
    this.balanceSheet = new Map<string, Map<string, number>>();
    this.totalGroupSpendings = 0;

  //Test Users - Uncomment if you want some default users.

    // this.addUser(new User("Nayan", "nayan@gmail.com"));
    // this.addUser(new User("Mayank", "mayank@gmail.com"));
    // this.addUser(new User("Hitesh", "hitesh@gmail.com"));
    // this.addUser(new User("Dishan", "dishan@gmail.com"));
    // this.addUser(new User("Avinash", "avi@gmail.com"));
  }

  addUser(user: User): CreateUserResponseDto {
    if (this.userMap.has(user.getEmail())) {
      throw new BadRequestException(
        new ErrorResponse(Errors.USER_ALREADY_EXISTS)
      );
    }
    this.userMap.set(user.getEmail(), user);
    this.balanceSheet.set(user.getEmail(), new Map<string, number>());
    return new SuccessResponse("User Created Successfully.", user);
  }

  addExpense(payload: CreateExpenseDto): CreateExpenseResponseDto {
    this.validateExpensePayload(payload);
    const { expenseType, amount, name, paidBy, splitInfo } = payload;
    const splits = this.createSplits(expenseType, splitInfo);
    const expense = ExpenseHelper.createExpense(
      expenseType,
      amount,
      name,
      this.userMap.get(paidBy),
      splits
    );
    this.expenses.push(expense);
    this.removeNegatives();

    for (const split of expense.getSplits()) {
      const paidTo = split.getUser().getEmail();
      const balances =
        this.balanceSheet.get(paidBy) || new Map<string, number>();
      if (!balances.has(paidTo)) {
        balances.set(paidTo, 0.0);
      }

      balances.set(
        paidTo,
        +(balances.get(paidTo)! + split.getAmount()).toFixed(2)
      );

      this.balanceSheet.set(paidBy, balances);
    }
    this.totalGroupSpendings = +(this.totalGroupSpendings + amount).toFixed(2);
    this.simplifyExpenses();

    return new SuccessResponse("Expense Created Successfully.");
  }

  showBalance(email: string): ShowBalanceDto {
    let isEmpty = true;
    const decodedEmail = decodeURIComponent(email);
    if (!this.isValidEmail(decodedEmail))
      throw new BadRequestException(Errors.INVALID_EMAIL);
    const userBalances = this.balanceSheet.get(decodedEmail);
    let transactionArray = [];
    let totalShare = 0;
    if (userBalances) {
      for (const [user, balance] of userBalances.entries()) {
        if (balance) {
          isEmpty = false;
          totalShare = +(totalShare + balance).toFixed(2);
          transactionArray.push(...this.printBalance(email, user, balance));
        }
      }
    }
    if (isEmpty) {
      transactionArray.push("No Balances");
    }
    if (totalShare < 0) {
      totalShare = Math.abs(totalShare);
    } else {
      totalShare = -totalShare;
    }
    return new SuccessResponse(
      `Balances for ${this.userMap.get(email)?.getName()} (${email})`,
      { trxs: transactionArray, totalShare }
    );
  }

  showBalances(): ShowBalancesDto {
    let isEmpty = true;
    let trxs = [];
    for (const [allBalancesUser, allBalances] of this.balanceSheet.entries()) {
      for (const [user, balance] of allBalances.entries()) {
        if (balance > 0) {
          isEmpty = false;
          trxs.push(...this.printBalance(allBalancesUser, user, balance));
        }
      }
    }

    if (isEmpty) {
      trxs.push("No Balances");
    }

    return new SuccessResponse(`Balances for all users.`, {
      trxs,
      totalGroupSpendings: this.totalGroupSpendings,
    });
  }

  private printBalance(
    user1: string,
    user2: string,
    amount: number
  ): Array<string> {
    const user1Name = this.userMap.get(user1)?.getName();
    const user2Name = this.userMap.get(user2)?.getName();
    let trxs: Array<string> = [];

    if (user1Name && user2Name) {
      if (amount < 0) {
        trxs.push(`${user1Name} owes ${user2Name}: ${Math.abs(amount)}`);
      } else if (amount > 0) {
        trxs.push(`${user2Name} owes ${user1Name}: ${Math.abs(amount)}`);
      }
    }

    return trxs;
  }

  private createSplits(
    expenseType: ExpenseType,
    splitInfo: SplitInfo[]
  ): Split[] {
    const splits: Split[] = [];
    switch (expenseType) {
      case "EQUAL":
        for (let user of this.userMap.keys()) {
          splits.push(new EqualSplit(this.userMap.get(user)));
        }
        break;
      case "UNEQUAL":
        for (let user of splitInfo) {
          splits.push(
            new UnequalSplit(this.userMap.get(user.email), user.amount)
          );
        }
        break;
    }
    return splits;
  }

  private validateExpensePayload(payload: CreateExpenseDto): void {
    let invalidPayload = false;
    const { expenseType, numberOfUsers, splitInfo, amount, paidBy } = payload;
    const totalUsers = this.userMap.size;

    if (!this.userMap.has(paidBy)) invalidPayload = true;

    if (expenseType === ExpenseType.UNEQUAL) {
      if (
        !numberOfUsers ||
        numberOfUsers > totalUsers ||
        splitInfo.length !== numberOfUsers
      ) {
        invalidPayload = true;
      }

      let sumSplitAmount = 0;
      for (let split of splitInfo) {
        sumSplitAmount = +(sumSplitAmount + split.amount).toFixed(2);
        if (!this.userMap.has(split.email)) {
          invalidPayload = true;
          break;
        }
      }

      if (sumSplitAmount !== amount) invalidPayload = true;
    }

    if (invalidPayload) throw new BadRequestException(Errors.INVALID_PAYLOAD);

    return;
  }

  private simplifyExpenses(): void {
    const transactions = [];
    for (const [allBalancesUser, allBalances] of this.balanceSheet.entries()) {
      for (const [user, balance] of allBalances.entries()) {
        if (balance > 0) {
          transactions.push([user, allBalancesUser, balance]);
        }
      }
    }

    const score = {};

    for (const [from, to, amount] of transactions) {
      if (!score[from]) {
        score[from] = 0;
      }
      if (!score[to]) {
        score[to] = 0;
      }
      score[from] = +(score[from] - amount).toFixed(2);
      score[to] = +(score[to] + amount).toFixed(2);
    }

    const positives = Object.entries(score).filter((a) => (a[1] as number) > 0);
    const negatives = Object.entries(score).filter((a) => (a[1] as number) < 0);

    let newPositives, newNegatives;
    let minTxnCount = Infinity;
    let simplifiedTransactions;
    function recursion(positives, negatives, currentTransactions = []) {
      if (positives.length + negatives.length == 0) {
        if (currentTransactions.length < minTxnCount) {
          minTxnCount = currentTransactions.length;
          simplifiedTransactions = currentTransactions;
        }
        return;
      }

      const negative = negatives[0];
      const negativeScore = negative[1];

      for (let positive of positives) {
        const positiveScore = positive[1];
        newPositives = [...positives];
        newNegatives = [...negatives];

        delete newPositives[newPositives.indexOf(positive)];
        delete newNegatives[newNegatives.indexOf(negative)];
        newPositives = newPositives.filter((a) => a);
        newNegatives = newNegatives.filter((a) => a);

        let updatedTransactions;

        if (positiveScore === Math.abs(negativeScore)) {
          updatedTransactions = [
            ...currentTransactions,
            [negative[0], positive[0], positiveScore],
          ];
        } else if (positiveScore > Math.abs(negativeScore)) {
          updatedTransactions = [
            ...currentTransactions,
            [negative[0], positive[0], Math.abs(negativeScore)],
          ];
          newPositives.push([
            positive[0],
            +(positiveScore + negativeScore).toFixed(2),
          ]);
        } else {
          updatedTransactions = [
            ...currentTransactions,
            [negative[0], positive[0], positiveScore],
          ];
          newNegatives.push([
            negative[0],
            +(positiveScore + negativeScore).toFixed(2),
          ]);
        }

        recursion(newPositives, newNegatives, updatedTransactions);
      }
    }
    recursion(positives, negatives);
    this.reconstructBalanceSheet(simplifiedTransactions);
    return;
  }

  private reconstructBalanceSheet(
    transactions: Array<[string, string, number]>
  ): void {
    const newMap = new Map<string, Map<string, number>>();

    for (const [from, to, amount] of transactions) {
      // Add positive balances - To -> From
      if (newMap.has(to)) {
        const trxMap = newMap.get(to);
        trxMap.set(from, amount);
        newMap.set(to, trxMap);
      } else {
        const trxMap = new Map<string, number>();
        trxMap.set(from, amount);
        newMap.set(to, trxMap);
      }

      // Add negative balances - From -> To
      if (newMap.has(from)) {
        const trxMap = newMap.get(from);
        trxMap.set(to, -amount);
        newMap.set(from, trxMap);
      } else {
        const trxMap = new Map<string, number>();
        trxMap.set(to, -amount);
        newMap.set(from, trxMap);
      }
    }
    this.balanceSheet = newMap;
    return;
  }

  private isValidEmail(email: string): boolean {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private removeNegatives(): void {
    for (const [allBalancesUser, allBalances] of this.balanceSheet.entries()) {
      for (const [user, balance] of allBalances.entries()) {
        if (balance < 0) {
          allBalances.delete(user);
        }
      }
    }
    return;
  }
}
