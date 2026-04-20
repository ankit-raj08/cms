'use client'

import React, { useEffect, useMemo, useState } from 'react'

import {
  getActiveProjectFromStorage,
  installProjectHeaderInterceptor,
  setActiveProject,
} from '@/utils/apiClient'

type ProjectItem = {
  id: number | string
  name?: string | null
}

export default function ProjectSwitcher() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  useEffect(() => {
    const cleanup = installProjectHeaderInterceptor()
    return cleanup
  }, [])

  useEffect(() => {
    setSelectedProjectId(getActiveProjectFromStorage())
  }, [])

  useEffect(() => {
    const fetchProjects = async (): Promise<void> => {
      try {
        const response = await window.fetch('/api/projects?limit=100&depth=0')
        if (!response.ok) return

        const result = (await response.json()) as { docs?: ProjectItem[] }
        const docs = Array.isArray(result.docs) ? result.docs : []
        setProjects(docs)

        if (!docs.length) return

        const existingProjectId = getActiveProjectFromStorage()
        const hasExistingProject = docs.some((project) => String(project.id) === existingProjectId)

        if (hasExistingProject) {
          setSelectedProjectId(existingProjectId)
          return
        }

        const firstProjectId = String(docs[0].id)
        setActiveProject(firstProjectId)
        setSelectedProjectId(firstProjectId)
        window.location.reload()
      } catch {
        // Keep header UI resilient if projects request fails.
      }
    }

    void fetchProjects()
  }, [])

  const options = useMemo(() => {
    return projects.map((project) => ({
      value: String(project.id),
      label: project.name || `Project ${project.id}`,
    }))
  }, [projects])

  const onChangeProject = (nextProjectId: string): void => {
    setActiveProject(nextProjectId)
    setSelectedProjectId(nextProjectId)
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
      <label htmlFor="project-switcher">Project</label>
      <select
        id="project-switcher"
        value={selectedProjectId}
        onChange={(event) => onChangeProject(event.target.value)}
      >
        <option value="">Select project</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
