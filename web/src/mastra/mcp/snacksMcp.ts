// src/mastra/mcp/snacksMcp.ts
import { MCPServer } from "@mastra/mcp";
import { addSnackTool, deleteSnackTool, updateSnackTool, searchSnacksTool, semanticSearchSnacksTool } from "../tools/snackTools";

export const snacksMcpServer = new MCPServer({
  name: "Snacks MCP Server",
  version: "1.0.0",
  tools: { searchSnacksTool, addSnackTool, deleteSnackTool, updateSnackTool, semanticSearchSnacksTool }
});
