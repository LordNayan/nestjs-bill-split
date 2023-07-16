import { SplitService } from "@split/split.service";
import { User } from "@split/models/user.entity";
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
import { CreateExpenseEqualMock, CreateExpenseUnequalMock, TEST_USER_EMAIL_1, TEST_USER_EMAIL_2, TEST_USER_EMAIL_3, TEST_USER_NAME_1, TEST_USER_NAME_2, TEST_USER_NAME_3 } from "./mockData/split.mockData";

describe("SplitService", () => {
  let splitService: SplitService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [SplitService, ExpenseHelper],
    }).compile();

    splitService = moduleRef.get<SplitService>(SplitService);
  });

  describe("addUser", () => {
    it("should add a new user and return a success response", () => {
      // Create a new user
      const user = new User("Test User", "test@example.com");

      // Add the user using addUser() method
      const response = splitService.addUser(user);

      // Verify the response
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.message).toBe("User Created Successfully.");
      expect(response.data).toBe(user);
    });

    it("should throw BadRequestException when trying to add an existing user", () => {
      // Create an existing user
      const existingUser = new User("Existing User", "test@example.com");

      // Add the existing user first
      splitService.addUser(existingUser);

      // Create a new user with the same email
      const newUser = new User("New User", "test@example.com");

      // Verify that adding the new user throws BadRequestException
      expect(() => splitService.addUser(newUser)).toThrowError(
        BadRequestException
      );
    });
  });

  describe("addExpense", () => {
    it("should add an equal expense and update the balance sheet", () => {
      // Prepare test data
      const expensePayload: CreateExpenseDto = CreateExpenseEqualMock;

      // Mock the necessary methods and entities
      const userMap = new Map<string, User>();
      const user1 = new User(TEST_USER_NAME_1, TEST_USER_EMAIL_1);
      const user2 = new User(TEST_USER_NAME_2, TEST_USER_EMAIL_2);
      userMap.set(TEST_USER_EMAIL_1, user1);
      userMap.set(TEST_USER_EMAIL_2, user2);
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
      expect(balanceSheet.get(TEST_USER_EMAIL_1)).toBeDefined();
      expect(balanceSheet.get(TEST_USER_EMAIL_2)).toBeDefined();

      // Verify the total group spendings
      expect(splitService["totalGroupSpendings"]).toBe(100);
    });

    it("should add an unequal expense and update the balance sheet", () => {
      // Prepare test data
      const expensePayload: CreateExpenseDto = CreateExpenseUnequalMock;

      // Mock the necessary methods and entities
      const userMap = new Map<string, User>();
      const user1 = new User(TEST_USER_NAME_1, TEST_USER_EMAIL_1);
      const user2 = new User(TEST_USER_NAME_2, TEST_USER_EMAIL_2);
      const user3 = new User(TEST_USER_NAME_3, TEST_USER_EMAIL_3);
      userMap.set(TEST_USER_EMAIL_1, user1);
      userMap.set(TEST_USER_EMAIL_2, user2);
      userMap.set(TEST_USER_EMAIL_3, user3);
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
      expect(balanceSheet.get(TEST_USER_EMAIL_1)).toBeDefined();
      expect(balanceSheet.get(TEST_USER_EMAIL_1)?.size).toBe(2);
      expect(
        balanceSheet.get(TEST_USER_EMAIL_1)?.get(TEST_USER_EMAIL_2)
      ).toBe(50);
      expect(
        balanceSheet.get(TEST_USER_EMAIL_1)?.get(TEST_USER_EMAIL_3)
      ).toBe(150);

      // Verify the total group spendings
      expect(splitService["totalGroupSpendings"]).toBe(200);
    });

    it("should throw an error for an invalid expense payload", () => {
      // Prepare test data
      delete(CreateExpenseUnequalMock.numberOfUsers)
      const expensePayload: CreateExpenseDto = CreateExpenseUnequalMock;

      // Execute the method and verify the error
      expect(() => splitService.addExpense(expensePayload)).toThrowError(
        BadRequestException
      );
    });
  });
});
