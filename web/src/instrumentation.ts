// Forces Mastra to be imported and registered, this triggers the database creation
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./mastra");
  }
}
