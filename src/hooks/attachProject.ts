import type { CollectionBeforeChangeHook } from 'payload'
import { getActiveProject } from '@/utils/getActiveProject'

export const attachProject: CollectionBeforeChangeHook = async ({ req, data }) => {
  const projectId = await getActiveProject(req)
  const nextData = (data ?? {}) as Record<string, unknown>
  const selectedProject = nextData.project

  if (selectedProject) {
    return nextData
  }

  if (!projectId) {
    console.warn('No project context, skipping')
    return nextData
  }

  nextData.project = projectId
  return nextData
}
