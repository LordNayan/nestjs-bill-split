import { resolve } from "path";

module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/user/**/*.(t|j)s", "**/loan/**/*.(t|j)s"],
  coveragePathIgnorePatterns: [
    ".module.ts",
    "main.ts",
    "configuration.ts",
    ".validation.ts",
    ".interface.ts",
    ".d.ts",
    ".entity.ts",
    ".event.ts",
    "console.ts",
    "strategy.ts",
    ".dto.ts",
    "tests/data/*",
    ".config.ts",
    ".enum.ts",
    ".decorator.ts",
    ".e2e-spec.ts$",
    "routes.ts",
    "stores.constant.ts",
    "tax/test/data/*",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@src/(.*)$": resolve(__dirname, "../src/$1"),
    "^@split/(.*)$": resolve(__dirname, "../src/split/$1"),
    "^@common/(.*)$": resolve(__dirname, "../src/common/$1"),
  },
};
