import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@src/app.module";
import { ContextProvider } from "@common/services/http-context.service";
import {
  LoanDataMock,
  RepaymentLoanMock,
  getLoansResponseMock,
} from "@loan/test/mockData/loan.mockData";
import { Errors } from "@common/enums/error.enum";
import { LoanStatus, RepaymentStatus } from "@common/enums/loan.enum";

const DefaultUserId = 1;
const DefaultAdmin = "admin";
const DefaultPassword = "123456";

describe("Login, Create User, Create Loan, Get Loan (e2e)", () => {
  let app: INestApplication;
  let server: { close: () => void };
  const userFindOneMock = jest.fn();
  const userFindOneOrFailMock = jest.fn();
  const getContextMock = jest.fn();
  const setContextMock = jest.fn();
  const loanSaveMock = jest.fn();
  const repaymentSaveMock = jest.fn();
  const loanfindOneOrFailMock = jest.fn();
  const repaymentFindOneMock = jest.fn();
  const loanFindOneMock = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider("UserRepository")
      .useFactory({
        factory: () => ({
          save: jest.fn(),
          findOneOrFail: userFindOneOrFailMock,
          findOne: userFindOneMock,
        }),
      })
      .overrideProvider("LoanRepository")
      .useFactory({
        factory: () => ({
          findOne: loanFindOneMock,
          findOneOrFail: loanfindOneOrFailMock,
          save: loanSaveMock,
        }),
      })
      .overrideProvider("RepaymentRepository")
      .useFactory({
        factory: () => ({
          findOne: repaymentFindOneMock,
          findOneOrFail: jest.fn(),
          save: repaymentSaveMock,
        }),
      })
      .overrideProvider(ContextProvider)
      .useFactory({
        factory: () => ({
          get: getContextMock,
          set: setContextMock,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      })
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    server.close();
  });

  let authToken: string;
  describe("/user/login (POST)", () => {
    it("should log-in user and return a token", () => {
      const loginDto = {
        userName: DefaultAdmin,
        password: DefaultPassword,
      };

      userFindOneOrFailMock.mockResolvedValue({
        id: DefaultUserId,
        password:
          "$2b$10$6SxcbS2C3i0Tpc3xroLNz.F45upPho9NxNRleyOo59dArK3yBcFHi",
        isAdmin: true,
        userName: DefaultAdmin,
      });

      return request(server)
        .post("/user/login")
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("token");
          authToken = res.body.token;
        });
    });

    it("should return an error for invalid credentials", () => {
      const loginDto = {
        userName: "testuser",
        password: "wrongpassword",
      };
      return request(server)
        .post("/user/login")
        .send(loginDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toEqual("INVALID_CREDENTIALS");
        });
    });
  });

  describe("/user create (POST)", () => {
    it("should create a user and return a success message", async () => {
      const createUserDto = {
        userName: DefaultAdmin,
        password: DefaultPassword,
        isAdmin: true,
      };
      setContextMock.mockResolvedValue(DefaultUserId);
      getContextMock.mockResolvedValue(DefaultUserId);
      return await request(server)
        .post("/user")
        .send(createUserDto)
        .auth(authToken, { type: "bearer" })
        // .expect(201)
        .expect((res) => {
          delete createUserDto.password;
          expect(res.body).toEqual({
            message: "User Created Successfully",
            ...createUserDto,
          });
        });
    });
  });

  describe("/loan create (POST)", () => {
    it("should create a new loan", async () => {
      const payload = {
        amount: 10000,
        term: 3,
      };
      getContextMock.mockResolvedValue(DefaultUserId);
      userFindOneMock.mockResolvedValue({
        id: DefaultUserId,
        userName: DefaultAdmin,
        password: DefaultPassword,
        isAdmin: true,
      });
      loanSaveMock.mockResolvedValue(LoanDataMock);
      repaymentSaveMock.mockResolvedValue(RepaymentLoanMock);
      const response = await request(server)
        .post("/loan")
        .send(payload)
        .auth(authToken, { type: "bearer" })
        .expect(201);

      expect(response.body).toHaveProperty("loan");
      expect(response.body.loan).toHaveProperty("id");
      expect(response.body.loan).toHaveProperty("amount", payload.amount);
      expect(response.body.loan).toHaveProperty("term", payload.term);
      expect(response.body.loan).toHaveProperty("repayments");
    });

    it("should return 400 if invalid payload is provided", async () => {
      const payload = {
        amount: -1000, // Invalid amount
        term: 12,
      };

      const response = await request(server)
        .post("/loan")
        .send(payload)
        .auth(authToken, { type: "bearer" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("/loan (GET)", () => {
    it("should get all loans", async () => {
      userFindOneOrFailMock.mockResolvedValue({
        id: DefaultUserId,
        isAdmin: true,
        userName: DefaultAdmin,
        loans: getLoansResponseMock.loans,
      });
      getContextMock.mockResolvedValue(DefaultUserId);
      const response = await request(server)
        .get("/loan")
        .auth(authToken, { type: "bearer" })
        .expect(200);

      expect(response.body).toHaveProperty("loans");
      expect(Array.isArray(response.body.loans)).toBeTruthy();
    });
  });

  describe("GET /loan/:id", () => {
    it("should get a loan by its ID", async () => {
      const loanId = "loanId";
      loanfindOneOrFailMock.mockResolvedValue(LoanDataMock);
      const response = await request(server)
        .get(`/loan/${loanId}`)
        .auth(authToken, { type: "bearer" })
        .expect(200);

      expect(response.body).toHaveProperty("id", loanId);
      expect(response.body).toHaveProperty("amount");
      expect(response.body).toHaveProperty("term");
      expect(response.body).toHaveProperty("repayments");
    });
  });

  it("should return 404 if loan not found", async () => {
    const loanId = "999";
    loanfindOneOrFailMock.mockRejectedValue(new NotFoundException());
    const response = await request(server)
      .get(`/loan/${loanId}`)
      .auth(authToken, { type: "bearer" })
      .expect(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("error");
    expect(response.body.message).toBe(Errors.LOAN_NOT_FOUND);
  });

  describe("POST /loan/approve", () => {
    it("should mark a loan as approved", async () => {
      const repaymentId = "456";
      getContextMock.mockResolvedValue(DefaultUserId);
      setContextMock.mockResolvedValue(DefaultUserId);
      loanFindOneMock.mockResolvedValue(LoanDataMock);
      loanSaveMock.mockResolvedValue(LoanDataMock);

      const response = await request(server)
        .post(`/loan/approve/${repaymentId}`)
        .auth(authToken, { type: "bearer" })
        .expect(200);

      expect(response.body).toHaveProperty("status", LoanStatus.APPROVED);
    });
  });

  describe("POST /loan/:id/pay", () => {
    it("should mark a repayment as paid", async () => {
      const repaymentId = "1";
      const approvedLoanData = { ...RepaymentLoanMock };
      approvedLoanData.loan.status = LoanStatus.APPROVED;
      repaymentFindOneMock.mockResolvedValue(approvedLoanData);
      repaymentSaveMock.mockResolvedValue(approvedLoanData);
      loanfindOneOrFailMock.mockResolvedValue(LoanDataMock);

      const response = await request(server)
        .post(`/loan/${repaymentId}`)
        .auth(authToken, { type: "bearer" })
        .expect(200);

      expect(response.body).toHaveProperty("repayment");
      expect(response.body.repayment).toHaveProperty("id", repaymentId);
      expect(response.body.repayment).toHaveProperty(
        "status",
        RepaymentStatus.PAID
      );
    });
  });
});
