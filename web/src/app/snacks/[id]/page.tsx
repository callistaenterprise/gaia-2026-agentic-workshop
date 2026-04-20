import { db } from '@/backend/db/dbClient'
import { snacks } from '@/backend/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { SnackDetail } from '@/components/snacks/SnackDetail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SnackPage({ params }: Props) {
  const { id } = await params

  const snack = await db.query.snacks.findFirst({
    where: eq(snacks.id, id),
  })

  if (!snack) {
    notFound()
  }

  return <SnackDetail snack={snack} />
}
