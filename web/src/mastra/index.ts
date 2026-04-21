// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).AI_SDK_LOG_WARNINGS = false;

import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { chatAgent } from "./agents/chatAgent";
import { ConsoleLogger, LogLevel } from "@mastra/core/logger";
import { eventAgent } from "./agents/eventAgent";
import { participantAgent } from "./agents/participantAgent";
const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";

export const mastra = new Mastra({
  agents: { chatAgent, eventAgent, participantAgent },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:../db/mastra.db",
  }),
  logger: new ConsoleLogger({
    level: LOG_LEVEL,
  }),
});
