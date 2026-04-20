import { db } from '@/backend/db/dbClient'
import { snacks } from '@/backend/db/schema'
import { asc } from 'drizzle-orm'
import { SnackList } from '@/components/snacks/SnackList'
import { ReindexButton } from '@/components/snacks/ReindexButton'
import Link from 'next/link'

export default async function SnacksPage() {
  const allSnacks = await db.select().from(snacks).orderBy(asc(snacks.name))

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Snacks</h1>
        <div className="flex items-center gap-3">
          <ReindexButton />
          <Link
            href="/snacks/embeddings"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            View embedding map
          </Link>
        </div>
      </div>
      <SnackList initialSnacks={allSnacks} />
    </main>
  )
}
