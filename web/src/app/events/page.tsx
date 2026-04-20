import { db } from '@/backend/db/dbClient'
import { events } from '@/backend/db/schema'
import { asc } from 'drizzle-orm'
import { EventTable } from '@/components/events/EventTable'

export default async function EventsPage() {
  const allEvents = await db.select().from(events).orderBy(asc(events.date))

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Events</h1>

      {allEvents.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <EventTable events={allEvents} />
      )}
    </main>
  )
}
