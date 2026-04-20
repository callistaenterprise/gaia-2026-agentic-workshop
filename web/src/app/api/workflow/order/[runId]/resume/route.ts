import { mastra } from "@/mastra";
import { NextRequest, NextResponse } from "next/server"; // NextResponse kept for error responses

const workflowId = process.env.ORDER_WORKFLOW_ID ?? 'simpleOrderWorkflow';

/*
This route resumes the order workflow. 
A runId is provided in the URL, and the workflow is resumed with the "approved" flag.
*/
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const { approved } = await req.json();

  if (typeof approved !== "boolean") {
    return NextResponse.json({ error: "approved must be a boolean" }, { status: 400 });
  }

  try {
    const workflow = mastra.getWorkflow(workflowId as 'simpleOrderWorkflow' | 'optimizingOrderWorkflow');
    const run = await workflow.createRun({ runId });
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

        await run.resume({ step: "approve-order", resumeData: { approved } });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error("Failed to resume workflow", runId, e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
