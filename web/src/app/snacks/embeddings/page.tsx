import { Suspense } from 'react'
import { getSnackTsneCoordinates } from '@/backend/services/embeddingService'
import { SnackEmbeddingChart } from '@/components/snacks/SnackEmbeddingChart'
import { embedQueryAction } from './actions'

async function EmbeddingMap() {
  const initialPoints = await getSnackTsneCoordinates()
  return <SnackEmbeddingChart initialPoints={initialPoints} embedQuery={embedQueryAction} />
}

export default function SnackEmbeddingsPage() {
  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Snack Embedding Map</h1>
        <p className="text-muted-foreground text-sm mt-1">
          PCA (Principal Component Analysis) projection of snack embeddings into 2D space — similar snacks appear closer together
        </p>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
          Computing PCA projection…
        </div>
      }>
        <EmbeddingMap />
      </Suspense>
    </main>
  )
}
