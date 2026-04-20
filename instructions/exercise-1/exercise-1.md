# Exercise 1: Initial setup and test LLM provider

[&#x25c0; Go back to start page](../../README.md)

Welcome to the workshop! In this exercise, you'll prepare your environment, retrieve the latest code, and run a simple test to verify your LLM provider API key.

# Step-by-step instructions

## 1. Fetch latest updates from workshop repository

Open your terminal and navigate to the repository folder `gaia-2026-agentic-workshop`. 

```
cd gaia-2026-agentic-workshop
```

Run the following command to ensure you have the latest version of the code:

```
git pull origin main
```

## 2. Open the Project in your IDE

Before proceeding, open the project in your favorite IDE. For example, if you are using Visual Studio Code, you can run below command:

```
code .
```

Above command will launch VS Code with the current project folder.

## 3. Install the application

In your terminal, navigate to the `web` folder and install the necessary dependencies by running the following commands:
```
cd web
npm install
```

> **_NOTE:_** *Installing dependencies may take up to a few minutes. While it's running, please proceed to the next step (Step 4).*

## 4. Configure your LLM API key

The repository already contains a `web/.env` file with application configuration (such as `ORDER_WORKFLOW_ID`). You do not need to create or modify that file.

For your personal API key, create a new file named `.env.local` inside the `web` directory:

```
# .env.local in the web directory
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key
```

> **_NOTE:_** *Replace `your_api_key` with the key provided on your printed workshop note. You can either type it manually or scan the QR code on the note to copy it easily from your phone.*
>
> **_NOTE:_** *`.env.local` is listed in `.gitignore` and will never be committed — it is the right place for secrets and personal settings. The shared `.env` file is version controlled and contains only non-secret application configuration.*

## 5. Verify API key and LLM provider connectivity

Once the `npm install` command has finished in folder `web` and you have configured the API key, verify the API key and LLM provider connectivity by executing below command:
```
npm run test-exercise-1
```

Then, verify that the terminal displays log output similar to the sample below:

```
❯ npm run test-exercise-1

> starter@0.1.0 test-exercise-1
> npx tsx --tsconfig tsconfig.json test-exercises/exercise_1.ts

API key in "GOOGLE_GENERATIVE_AI_API_KEY" validated [OK]
Connection successful for Gemini. Status: 200 [OK]
All checks passed [OK]
```


## 6. Start the application and verify database connectivity

Inside the `web` directory, first populate the database:
```
npm run db:push
npm run db:seed
```

Then start the application:
```
npm run dev
```

Once the application is running, index the data into the vector database (required for semantic snack search). You will need to open a second terminal while the application is running, and run the following in the second terminal window:
```
npm run db:index
```

Once the application is running, open your web browser and navigate to the application
* http://localhost:3000

You should be able to click around on the different pages and see a list of events, participants, snacks and orders. You should also be able to inspect the embeddings map for snacks, which we will use later on in this workshop.

## Next steps

Once you've confirmed that:
- [ ] Your API key is correctly configured
- [ ] Your connection to the LLM provider works
- [ ] The database is populated
- [ ] The application is running

You are ready to proceed to Exercise 2.

[&#x25B6; Click here to proceed to Exercise 2](../exercise-2/exercise-2.md)
