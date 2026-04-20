'use server'

import { getSnackTsneCoordinatesWithQuery } from '@/backend/services/embeddingService'

export async function embedQueryAction(query: string) {
  return getSnackTsneCoordinatesWithQuery(query)
}
