import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ParticipantTable } from '@/components/participants/ParticipantTable'
import { getEventParticipants } from '@/backend/services/eventService'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: Props) {
  const { id } = await params

  const { event, participants } = await getEventParticipants(id)

  if (!event) {
    notFound()
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <Button asChild>
          <Link href={`/events/${id}/order`}>Create order</Link>
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">{event.date}</p>

      {event.description && (
        <p className="text-gray-700 mb-6">{event.description}</p>
      )}

      <h2 className="text-lg font-semibold mb-3">
        Participants ({participants.length})
      </h2>

      {participants.length === 0 ? (
        <p className="text-gray-500">No participants registered.</p>
      ) : (
        <ParticipantTable participants={participants} />
      )}
    </main>
  )
}
