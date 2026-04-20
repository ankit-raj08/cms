import type { PayloadRequest } from 'payload'

export const getActiveProject = async (req: PayloadRequest): Promise<string | null> => {
  const projectHeader =
    req.headers.get('x-project-id') ??
    (req.headers as unknown as Record<string, string | undefined>)['x-project-id']

  if (projectHeader) {
    try {
      const project = await req.payload.findByID({
        collection: 'projects',
        id: projectHeader,
        depth: 0,
        req,
      })

      if (project?.id) return String(project.id)
    } catch {
      // Invalid header project ID falls through to first-project fallback.
    }
  }

  try {
    const result = await req.payload.find({
      collection: 'projects',
      depth: 0,
      limit: 1,
      page: 1,
      req,
      sort: 'createdAt',
    })

    const firstProjectId = result.docs[0]?.id
    return firstProjectId ? String(firstProjectId) : null
  } catch {
    return null
  }
}
