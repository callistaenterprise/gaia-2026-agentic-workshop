import { getParticipants } from '@/backend/services/participantService'
import { ParticipantTable } from '@/components/participants/ParticipantTable'

export default async function ParticipantsPage() {
  const allParticipants = await getParticipants()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Participants</h1>

      {allParticipants.length === 0 ? (
        <p className="text-gray-500">No participants found.</p>
      ) : (
        <ParticipantTable participants={allParticipants} />
      )}
    </main>
  )
}
