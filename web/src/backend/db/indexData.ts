import { eq } from 'drizzle-orm'
import { db } from './dbClient'
import { participants } from './schema'
import { generateEmbedding, indexAllSnacks } from '../services/embeddingService'

async function indexData() {
  console.log('Indexing snacks into vector database...')
  await indexAllSnacks()
  console.log('  ✓ snacks indexed')

  const allParticipants = await db.select().from(participants)
  const withPreference = allParticipants.filter((p) => p.snackPreference)
  console.log(`Generating embeddings for ${withPreference.length} participants...`)
  for (const p of withPreference) {
    const embedding = await generateEmbedding(p.snackPreference!)
    const embeddingsBlob = Buffer.from(new Float32Array(embedding).buffer)
    await db.update(participants).set({ embeddings: embeddingsBlob }).where(eq(participants.id, p.id))
  }
  console.log('  ✓ participant embeddings generated')
  console.log('Done.')
  process.exit(0)
}

indexData().catch((err) => {
  console.error(err)
  process.exit(1)
})
