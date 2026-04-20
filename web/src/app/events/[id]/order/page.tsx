import { notFound } from 'next/navigation';
import { getEventParticipants } from '@/backend/services/eventService';
import { OrderWorkflowSchema } from '@/lib/types';
import OrderWorkflowClient from './components/OrderWorkflowClient';
import { z } from 'zod';

type OrderData = z.infer<typeof OrderWorkflowSchema>;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventOrderPage({ params }: Props) {
  const { id } = await params;
  const { event, participants } = await getEventParticipants(id);

  if (!event) {
    notFound();
  }

  const initialOrderData: OrderData = {
    awaitingApproval: false,
    orderId: undefined,
    eventId: event.id,
    totalCost: 0,
    noOfSnackTypes: 0,
    customerSatisfaction: 0,
    participants: participants.map((p) => ({
      participantId: p.id,
      participantName: `${p.firstName} ${p.lastName}`,
      snackPreference: p.snackPreference ?? '',
      selectedSnackId: null,
      snackOptions: [],
      selectedSnackPrice: null,
      customerSatisfaction: 0,
    })),
    instructions: '',
    excludedSnackIds: [],
    snackMaxPrice: null,
    optimizationHistory: [],
  };

  return (
    <OrderWorkflowClient
      eventName={event.name}
      initialOrderData={initialOrderData}
    />
  );
}
