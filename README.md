# Bill Splitter - Expense Management

A simple bill split app to manage expenses built on top of NestJS.

## Prerequisite

- Node.js v18 or higher
- npm v8 or higher
- pnpm v8 or higher

## Tech Stack

**Server:** Node, NestJS 

**Database:** In-memory Objects

**Package Manager:** pnpm

**Versions:** node v18.12.1 (npm v8.19.2) , pnpm 8.6.0

## Run Locally

1) Unzip the file

2) Go to the project directory

```bash
  cd nestjs-bill-split
```

3) Install node and pnpm **(Optional - No need if you already have it)**

```bash
After you have installed node,

RUN: sudo npm install -g pnpm
```

4) Install dependencies

```bash
RUN: pnpm install
```

5) Start the server

```bash
RUN: pnpm run start
```

6) Open Swagger

```bash
localhost:3000/docs
```

## Things to note

- For simplicity sake, this app dosent have a concept of group. All added users are part of the same global group. The group functionality can be easily added as the design supports it.

- Since everything is managed by in-memory objects, it wont persist if server is stopped/restarted.

- App supports expenses up to two decimal places. Any more than that will be rounded off.

- Email ids should be distinct while adding users. However, duplicate usernames are allowed.

- There are two kind of splits that the app supports while adding expenses, 
   
    ### EQUAL

    When expense type is EQUAL, it will divide the amount equally between all the users of the group. 

        Expense - **/api/expense** [POST]
        {
            "expenseType": "EQUAL",
            "name": "test expense",
            "paidBy": "avi@gmail.com",
            "amount": 1500.97
        }


    ### UNEQUAL

    When expense type is UNEQUAL, it will divide the amount as per the split information provided. 

    - Here, **numberOfUsers** and **splitInfo** are mandatory additional params. The length of **splitInfo** array should be equal to **numberOfUsers**.
            
        ```bash
        Expense - **/api/expense** [POST]
        {
        "expenseType": "UNEQUAL",
        "name": "test expense",
        "paidBy": "mayank@gmail.com",
        "amount": 3600,
        "numberOfUsers": 3,
        "splitInfo": [
            {
            "email": "nayan@gmail.com",
            "amount": 1200
            },
            {
            "email": "dishan@gmail.com",
            "amount": 1200
            },
            {
            "email": "avi@gmail.com",
            "amount": 1200
            }
        ]
        }


## Features

- Add User
- Add Expense (EQUALLY and UNEQUALLY)
- Get balances for a particular user with users total share.
- Get balances for all users with the total group spendings.


## Running Tests

To run tests, run the following command

```bash
  unit test:

  RUN: pnpm test:cov
```

![Unit Test](https://github.com/LordNayan/nest-loan/assets/51285263/9e0c578f-0cf4-48be-85e4-c5b55522949c)

```bash
  e2e test:
  
  RUN: pnpm test:e2e
```

![E2E Tests](https://github.com/LordNayan/nest-loan/assets/51285263/5599a37f-6d9c-4f30-b92c-1ff0e3821eb5)


## Support

For support, email nayan.lakhwani123@gmail.com.

