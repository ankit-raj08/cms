import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'

const TARGET_COLLECTIONS = ['pages', 'blogs', 'faqs', 'testimonials', 'media'] as const

const normalizeRelationshipId = (value: unknown): string | null => {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return null
}

const main = async (): Promise<void> => {
  const payload = await getPayload({ config })
  try {
    let totalDeleted = 0

    for (const collection of TARGET_COLLECTIONS) {
      let page = 1
      let hasNextPage = true
      const idsToDelete = new Set<string>()

      while (hasNextPage) {
        const result = await payload.find({
          collection,
          depth: 0,
          limit: 100,
          page,
          where: {},
        })

        for (const doc of result.docs as Array<Record<string, unknown>>) {
          const docId = normalizeRelationshipId(doc.id)
          const projectId = normalizeRelationshipId(doc.project)

          if (!docId) continue
          if (!projectId || projectId === '1') {
            idsToDelete.add(docId)
            continue
          }

          try {
            await payload.findByID({
              collection: 'projects',
              id: projectId,
              depth: 0,
            })
          } catch {
            idsToDelete.add(docId)
          }
        }

        hasNextPage = result.hasNextPage
        page += 1
      }

      for (const id of idsToDelete) {
        await payload.delete({
          collection,
          id,
        })
      }

      totalDeleted += idsToDelete.size
      console.log(`[cleanup] ${collection}: deleted ${idsToDelete.size} invalid document(s)`)
    }

    console.log(`[cleanup] done. total deleted: ${totalDeleted}`)
  } finally {
    await payload.db.destroy()
  }
}

void main()
