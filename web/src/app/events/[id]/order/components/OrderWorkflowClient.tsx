'use client';
import { useState, useRef } from 'react';
import { z } from 'zod';
import { parseJsonEventStream } from 'ai';
import { OrderWorkflowSchema } from '@/lib/types';
import ParticipantsTable from './ParticipantsTable';
import OrderSummary from './OrderSummary';

type OrderData = z.infer<typeof OrderWorkflowSchema>;

type Props = {
  eventName: string;
  initialOrderData: OrderData;
};

/*
  Utility function to read the workflow stream and update the order data.
  This makes the UI dynamic, as the workflow runs and the data is updated.
*/
async function readWorkflowStream(body: ReadableStream, onData: (data: OrderData) => void): Promise<void> {
  const eventStream = parseJsonEventStream({ stream: body, schema: z.unknown() });
  const reader = eventStream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value.success) continue;
      const event = (value.value as Record<string, unknown>)?.payload as Record<string, unknown> | undefined;
      if (event?.type === 'workflow-step-result' || event?.type === 'workflow-step-suspended') {
        const { output, suspendPayload } = (event.payload ?? {}) as { output?: unknown; suspendPayload?: unknown };
        const data = output ?? suspendPayload;
        if (data && typeof data === 'object' && 'eventId' in data) {
          onData(data as OrderData);
        }
      }
    }
  } catch (e) {
    if ((e as Error).name !== 'AbortError') throw e;
  }
}

export default function OrderWorkflowClient({ eventName, initialOrderData }: Props) {
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);
  const [instructions, setInstructions] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [workflowStarted, setWorkflowStarted] = useState(initialOrderData.totalCost > 0);
  const [approvalState, setApprovalState] = useState<'idle' | 'approved' | 'rejected'>('idle');
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const abortWorkflow = () => {
    abortControllerRef.current?.abort();
  };

  /*
  * Start the workflow. This is called when the user clicks the "Prepare order" button.
  */
  const startWorkflow = async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const orderDataWithInstructions = { ...initialOrderData, instructions: instructions || undefined };
    setOrderData(orderDataWithInstructions);
    setIsRunning(true);
    setWorkflowStarted(true);
    setApprovalState('idle');
    const response = await fetch('/api/workflow/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderData: orderDataWithInstructions }),
      signal: controller.signal,
    });
    await readWorkflowStream(response.body!, setOrderData);
    setIsRunning(false);
    abortControllerRef.current = null;
  };

  /*
   * Resume the workflow with the "approved" flag. 
   * This is called when the user clicks the "Approve" or "Reject" buttons.
   */
  const resumeWorkflow = async (approved: boolean) => {
    if (!orderData.workflowRunId) return;
    setApprovalError(null);

    const response = await fetch(`/api/workflow/order/${orderData.workflowRunId}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });

    if (!response.ok) {
      setApprovalError(`Failed to ${approved ? 'approve' : 'reject'} order. Please try again.`);
      return;
    }

    if (!approved) {
      response.body?.cancel();
      setApprovalState('rejected');
      return;
    }

    setIsRunning(true);
    await readWorkflowStream(response.body!, setOrderData);
    setApprovalState('approved');
    setIsRunning(false);
  };

  const handleApprove = () => resumeWorkflow(true);
  const handleReject = () => resumeWorkflow(false);



  const showApprovalButtons =
    workflowStarted &&
    !isRunning &&
    orderData.awaitingApproval === true &&
    approvalState === 'idle';

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order snacks för event '{eventName}'</h1>

      {workflowStarted && orderData.totalCost > 0 && (
        <OrderSummary totalCost={orderData.totalCost} noOfSnackTypes={orderData.noOfSnackTypes} customerSatisfaction={orderData.customerSatisfaction} />
      )}

      <ParticipantsTable participants={orderData.participants} />

      <div className="space-y-1">
        <label htmlFor="instructions" className="text-sm font-medium text-gray-700">Instructions</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          disabled={isRunning}
          placeholder="e.g. prioritize low cost, fewer snack types…"
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
        />
      </div>

      {workflowStarted && orderData.optimizationHistory.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-700">Optimization History</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-900">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Total Cost</th>
                  <th className="px-4 py-2 text-left">Snack Types</th>
                  <th className="px-4 py-2 text-left">Max Price</th>
                  <th className="px-4 py-2 text-left">Excluded Snack IDs</th>
                  <th className="px-4 py-2 text-left">Customer satisfaction</th>
                  <th className="px-4 py-2 text-left">Meets Instructions</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderData.optimizationHistory.map(h => (
                  <tr key={h.iteration} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{h.iteration}</td>
                    <td className="px-4 py-2">{h.totalCost}</td>
                    <td className="px-4 py-2">{h.noOfSnackTypes}</td>
                    <td className="px-4 py-2">{h.snackMaxPrice ?? '—'}</td>
                    <td className="px-4 py-2 text-gray-500">{h.excludedSnackIds.length > 0 ? h.excludedSnackIds.join(', ') : '—'}</td>
                    <td className="px-4 py-2">{h.customerSatisfaction.toFixed(1)}</td>
                    <td className="px-4 py-2">{h.meetsInstructions ? '✓' : '✗'}</td>
                    <td className="px-4 py-2 text-gray-500">{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isRunning && orderData.totalCost === 0 && workflowStarted && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 animate-pulse">
          Workflow in progress…
        </div>
      )}

      {orderData.orderId && (
        <p className="text-sm text-green-700 font-medium">
          Order created: {orderData.orderId}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={startWorkflow}
          disabled={isRunning}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Running…
            </span>
          ) : 'Prepare order'}
        </button>

        {isRunning && (
          <button
            onClick={abortWorkflow}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Abort
          </button>
        )}



        {showApprovalButtons && (
          <>
            <button
              onClick={handleApprove}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Approve order
            </button>
            <button
              onClick={handleReject}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )}



        {approvalState === 'approved' && (
          <span className="text-sm text-green-700 font-medium">
            Order approved —{' '}
            <a href="/orders" className="underline">view orders</a>
          </span>
        )}

        {approvalState === 'rejected' && (
          <span className="text-sm text-gray-600 font-medium">Order rejected.</span>
        )}

        {approvalError && (
          <span className="text-sm text-red-600">{approvalError}</span>
        )}
      </div>
    </main>
  );
}
