import { SplitService } from "@split/split.service";
import { User } from "@split/models/user.entity";
import { ExpenseType } from "@split/enums/expense-type.enum";
import { EqualSplit } from "@split/models/split/equal-split.entity";
import { UnequalSplit } from "@split/models/split/unequal-split.entity";
import { BadRequestException } from "@nestjs/common";
import { SuccessResponse } from "@src/common/dto/response.dto";
import { Test } from "@nestjs/testing";
import { ExpenseHelper } from "../helpers/expense.helper";
import {
  CreateExpenseDto,
  CreateExpenseResponseDto,
} from "../dto/create-expense.dto";

describe("SplitService", () => {
  let splitService: SplitService;
  let expenseHelper: ExpenseHelper;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SplitService, ExpenseHelper],
    }).compile();

    splitService = moduleRef.get<SplitService>(SplitService);
    expenseHelper = moduleRef.get<ExpenseHelper>(ExpenseHelper);
  });

  describe("addUser", () => {
    it("should add a new user and return a success response", () => {
      // Create a new user
      const user = new User("", "");
      user.setEmail("test@example.com");
      user.setName("Test User");

      // Add the user using addUser() method
      const response = splitService.addUser(user);

      // Verify the response
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.message).toBe("User Created Successfully.");
      expect(response.data).toBe(user);
    });

    it("should throw BadRequestException when trying to add an existing user", () => {
      // Create an existing user
      const existingUser = new User("", "");
      existingUser.setEmail("test@example.com");
      existingUser.setName("Existing User");

      // Add the existing user first
      splitService.addUser(existingUser);

      // Create a new user with the same email
      const newUser = new User("", "");
      newUser.setEmail("test@example.com");
      newUser.setName("New User");

      // Verify that adding the new user throws BadRequestException
      expect(() => splitService.addUser(newUser)).toThrowError(
        BadRequestException
      );
    });
  });

  describe("addExpense", () => {
    it("should add an equal expense and update the balance sheet", () => {
      // Prepare test data
      const expensePayload: CreateExpenseDto = {
        expenseType: ExpenseType.EQUAL,
        amount: 100,
        name: "Equal Expense",
        paidBy: "user1@example.com",
      };

      // Mock the necessary methods and entities
      const userMap = new Map<string, User>();
      const user1 = new User("User 1", "user1@example.com");
      const user2 = new User("User 2", "user2@example.com");
      userMap.set("user1@example.com", user1);
      userMap.set("user2@example.com", user2);
      splitService["userMap"] = userMap;

      const expense = ExpenseHelper.createExpense(
        expensePayload.expenseType,
        expensePayload.amount,
        expensePayload.name,
        user1,
        [new EqualSplit(user1), new EqualSplit(user2)]
      );
      const expectedResponse: CreateExpenseResponseDto = new SuccessResponse(
        "Expense Created Successfully."
      );

      // Execute the method
      const response = splitService.addExpense(expensePayload);

      // Verify the response
      expect(response).toEqual(expectedResponse);
      expect(splitService["expenses"]).toContainEqual(expense);

      // Verify the balance sheet
      const balanceSheet = splitService["balanceSheet"];
      expect(balanceSheet.size).toBe(2);
      expect(balanceSheet.get("user1@example.com")).toBeDefined();
      expect(balanceSheet.get("user2@example.com")).toBeDefined();

      // Verify the total group spendings
      expect(splitService["totalGroupSpendings"]).toBe(100);
    });

    it("should add an unequal expense and update the balance sheet", () => {
      // Prepare test data
      const expensePayload: CreateExpenseDto = {
        expenseType: ExpenseType.UNEQUAL,
        amount: 200,
        name: "Unequal Expense",
        paidBy: "user1@example.com",
        numberOfUsers: 2,
        splitInfo: [
          { email: "user2@example.com", amount: 50 },
          { email: "user3@example.com", amount: 150 },
        ],
      };

      // Mock the necessary methods and entities
      const userMap = new Map<string, User>();
      const user1 = new User("User 1", "user1@example.com");
      const user2 = new User("User 2", "user2@example.com");
      const user3 = new User("User 3", "user3@example.com");
      userMap.set("user1@example.com", user1);
      userMap.set("user2@example.com", user2);
      userMap.set("user3@example.com", user3);
      splitService["userMap"] = userMap;

      const expense = ExpenseHelper.createExpense(
        expensePayload.expenseType,
        expensePayload.amount,
        expensePayload.name,
        user1,
        [new UnequalSplit(user2, 50), new UnequalSplit(user3, 150)]
      );
      const expectedResponse: CreateExpenseResponseDto = new SuccessResponse(
        "Expense Created Successfully."
      );

      // Execute the method
      const response = splitService.addExpense(expensePayload);

      // Verify the response
      expect(response).toEqual(expectedResponse);
      expect(splitService["expenses"]).toContainEqual(expense);

      // Verify the balance sheet
      const balanceSheet = splitService["balanceSheet"];
      expect(balanceSheet.size).toBe(3);
      expect(balanceSheet.get("user1@example.com")).toBeDefined();
      expect(balanceSheet.get("user1@example.com")?.size).toBe(2);
      expect(
        balanceSheet.get("user1@example.com")?.get("user2@example.com")
      ).toBe(50);
      expect(
        balanceSheet.get("user1@example.com")?.get("user3@example.com")
      ).toBe(150);

      // Verify the total group spendings
      expect(splitService["totalGroupSpendings"]).toBe(200);
    });

    it("should throw an error for an invalid expense payload", () => {
      // Prepare test data
      const expensePayload: CreateExpenseDto = {
        expenseType: ExpenseType.UNEQUAL,
        amount: 100,
        name: "Invalid Expense",
        paidBy: "user1@example.com",
        splitInfo: [
          { email: "user2@example.com", amount: 50 },
          { email: "user3@example.com", amount: 75 },
        ],
      };

      // Execute the method and verify the error
      expect(() => splitService.addExpense(expensePayload)).toThrowError(
        BadRequestException
      );
    });
  });
});
