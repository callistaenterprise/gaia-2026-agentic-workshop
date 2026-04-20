import { getParticipantById } from '@/backend/services/participantService'
import { notFound } from 'next/navigation'
import { ParticipantDetail } from '@/components/participants/ParticipantDetail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ParticipantPage({ params }: Props) {
  const { id } = await params

  const result = await getParticipantById(id)
  if (!result) notFound()

  return (
    <ParticipantDetail
      participant={result.participant}
      events={result.events}
    />
  )
}
