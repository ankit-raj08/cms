import type { Blog, Faq, Page } from '@/payload-types'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const pagesResult = await payload.find({
    collection: 'pages',
    limit: 1,
    depth: 1,
  })

  const page = pagesResult.docs[0] as Page | undefined
  if (!page) {
    return <main className="home">No page configured yet.</main>
  }

  const activeProjectId =
    typeof page.project === 'object' && page.project?.id ? page.project.id : page.project

  const sections = [...(page.sections ?? [])].sort((a, b) => {
    const leftOrder = typeof a?.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
    const rightOrder = typeof b?.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
    return leftOrder - rightOrder
  })

  const sectionNodes = await Promise.all(
    sections.map(async (section, index) => {
      if (!section?.blockType) return null

      if (section.blockType === 'hero') {
        return (
          <section key={`hero-${index}`}>
            <h1>{section.title}</h1>
            {section.subtitle ? <p>{section.subtitle}</p> : null}
          </section>
        )
      }

      if (section.blockType === 'blog-list' && activeProjectId) {
        const blogWhere: Record<string, unknown> = {
          project: {
            equals: activeProjectId,
          },
          status: {
            equals: 'published',
          },
        }

        if (section.filters?.tag) {
          blogWhere['tags.tag'] = {
            equals: section.filters.tag,
          }
        }

        const blogsResult = await payload.find({
          collection: 'blogs',
          where: blogWhere,
          limit: typeof section.limit === 'number' ? section.limit : 5,
          sort: '-publishedAt',
        })

        const blogs = blogsResult.docs as Blog[]

        return (
          <section key={`blog-list-${index}`}>
            {section.title ? <h2>{section.title}</h2> : null}
            <ul>
              {blogs.map((blogDoc) => (
                <li key={blogDoc.id}>
                  <strong>{blogDoc.title}</strong>
                  {blogDoc.excerpt ? <p>{blogDoc.excerpt}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        )
      }

      if (section.blockType === 'faq-section' && activeProjectId) {
        const faqsResult = await payload.find({
          collection: 'faqs',
          where: {
            project: {
              equals: activeProjectId,
            },
          },
          limit: typeof section.limit === 'number' ? section.limit : 100,
          sort: 'createdAt',
        })

        const faqs = faqsResult.docs as Faq[]

        return (
          <section key={`faq-section-${index}`}>
            {section.title ? <h2>{section.title}</h2> : null}
            {faqs.map((faq) => (
              <article key={faq.id}>
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </article>
            ))}
          </section>
        )
      }

      if (section.blockType === 'text-section') {
        const HeadingTag = (section.headingType || 'h2') as 'h1' | 'h2' | 'h3'
        return (
          <section key={`text-section-${index}`}>
            {section.heading ? <HeadingTag>{section.heading}</HeadingTag> : null}
            {section.content ? <div>{JSON.stringify(section.content)}</div> : null}
          </section>
        )
      }

      if (section.blockType === 'bullet-section') {
        return (
          <section key={`bullet-section-${index}`}>
            {section.title ? <h2>{section.title}</h2> : null}
            <ul>
              {(section.points ?? []).map((point, pointIndex) => (
                <li key={`point-${pointIndex}`}>{point.point}</li>
              ))}
            </ul>
          </section>
        )
      }

      if (section.blockType === 'quote-section') {
        return (
          <section key={`quote-section-${index}`}>
            {section.quote ? <blockquote>{section.quote}</blockquote> : null}
            {section.author ? <p>{section.author}</p> : null}
          </section>
        )
      }

      return null
    }),
  )

  return (
    <main className="home">
      {sectionNodes}
    </main>
  )
}
