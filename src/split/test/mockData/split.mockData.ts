import { ExpenseType } from "@src/split/enums/expense-type.enum";

export const TEST_USER_NAME_1 = "user1";
export const TEST_USER_EMAIL_1 = "user1@example.com";
export const TEST_USER_NAME_2 = "user2";
export const TEST_USER_EMAIL_2 = "user2@example.com";
export const TEST_USER_NAME_3 = "user3";
export const TEST_USER_EMAIL_3 = "user3@example.com";

export const CreateExpenseEqualMock = {
  expenseType: ExpenseType.EQUAL,
  amount: 100,
  name: "Equal Expense",
  paidBy: TEST_USER_EMAIL_1,
};

export const CreateExpenseUnequalMock = {
  expenseType: ExpenseType.UNEQUAL,
  amount: 200,
  name: "Unequal Expense",
  paidBy: TEST_USER_EMAIL_1,
  numberOfUsers: 2,
  splitInfo: [
    { email: TEST_USER_EMAIL_2, amount: 50 },
    { email: TEST_USER_EMAIL_3, amount: 150 },
  ],
};
