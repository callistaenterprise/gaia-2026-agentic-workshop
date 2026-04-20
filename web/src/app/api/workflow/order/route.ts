import { mastra } from '@/mastra';

const workflowId = process.env.ORDER_WORKFLOW_ID ?? 'simpleOrderWorkflow';

/*
This route starts the order workflow. This will trigger a "run" of the workflow.
The run will be watched for events, and the events will be streamed to the client.
The client will then display the events in the UI.
 */
export async function POST(req: Request) {

  console.log("activeOrderWorkflow: initiate");
  const { orderData } = await req.json();
  const workflow = mastra.getWorkflow(workflowId as 'simpleOrderWorkflow' | 'optimizingOrderWorkflow');
  const run = await workflow.createRun();
  console.log("activeOrderWorkflow: run created", run.runId);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      run.watch((event) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'workflow-step', payload: event })}\n\n`)
          );
        } catch {
          // controller already closed
        }
      });

      await run.start({ inputData: { ...orderData, workflowRunId: run.runId } });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
