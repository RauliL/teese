import prompts from "prompts";
import {
  initializeApplication,
  InitializeError,
  validateInitializeInput,
} from "../backend/initialize.js";
import { isValidUsername, UserValidationError } from "../backend/users.js";
import { BoardValidationError } from "../backend/boards.js";

async function promptForInitializeOptions() {
  let adminPassword = "";

  const response = await prompts(
    [
      {
        type: "text",
        name: "username",
        message: "Admin username",
        initial: "admin",
        validate: (value: string) =>
          isValidUsername(value.trim())
            ? true
            : "Username must be a valid slug (lowercase letters, numbers, and hyphens).",
      },
      {
        type: "password",
        name: "password",
        message: "Admin password",
        validate: (value: string) => {
          if (value.length < 8) {
            return "Password must be at least 8 characters.";
          }

          adminPassword = value;
          return true;
        },
      },
      {
        type: "password",
        name: "confirmPassword",
        message: "Confirm admin password",
        validate: (value: string) =>
          value === adminPassword || "Passwords do not match.",
      },
      {
        type: "text",
        name: "boardName",
        message: "Initial board name",
        initial: "My board",
        validate: (value: string) => {
          try {
            validateInitializeInput({
              username: "admin",
              password: "placeholder1",
              boardName: value,
            });
            return true;
          } catch (error) {
            if (error instanceof InitializeError) {
              return error.message;
            }

            throw error;
          }
        },
      },
    ],
    {
      onCancel: () => {
        console.log("Initialization cancelled.");
        process.exit(0);
      },
    },
  );

  if (!response.username || !response.password || !response.boardName) {
    process.exit(0);
  }

  return {
    username: response.username,
    password: response.password,
    boardName: response.boardName,
  };
}

async function main() {
  try {
    const options = await promptForInitializeOptions();
    const { user, board } = await initializeApplication(options);

    console.log(`Created admin user "${user.username}".`);
    console.log(`Created board "${board.name}".`);
    console.log("You can now start Teese and sign in.");
  } catch (error) {
    if (error instanceof InitializeError) {
      console.error(error.message);
      process.exit(1);
      return;
    }

    if (error instanceof UserValidationError) {
      console.error(error.message);
      process.exit(1);
      return;
    }

    if (error instanceof BoardValidationError) {
      console.error(error.message);
      process.exit(1);
      return;
    }

    throw error;
  }
}

await main();
