/* eslint-disable no-console */
'use client'

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import qs from 'qs'

import { Category, Product } from '../../../payload/payload-types'
import type { ArchiveBlockProps } from '../../_blocks/ArchiveBlock/types'
import { useFilter } from '../../_providers/Filter'
import { Card } from '../Card'
import { PageRange } from '../PageRange'
import { Pagination } from '../Pagination'

import classes from './index.module.scss'

type Result = {
  totalDocs: number
  docs: Product[]
  page: number
  totalPages: number
  hasPrevPage: boolean
  hasNextPage: boolean
  nextPage: number
  prevPage: number
}

export type Props = {
  className?: string
  relationTo?: 'products'
  populateBy?: 'collection' | 'selection'
  showPageRange?: boolean
  onResultChange?: (result: Result) => void
  limit?: number
  populatedDocs?: ArchiveBlockProps['populatedDocs']
  populatedDocsTotal?: ArchiveBlockProps['populatedDocsTotal']
  selectedDocs?: ArchiveBlockProps['selectedDocs']
  categories?: ArchiveBlockProps['categories']
  sort?: string // Added sort here
}

export const CollectionArchive: React.FC<Props> = props => {
  const { categoryFilters, sort } = useFilter()

  const {
    className,
    relationTo,
    showPageRange,
    onResultChange,
    limit = 10,
    populatedDocs,
    populatedDocsTotal,
    selectedDocs,
    populateBy,
  } = props

  const [results, setResults] = useState<Result>({
    totalDocs: typeof populatedDocsTotal === 'number' ? populatedDocsTotal : 0,
    docs: (populatedDocs?.map(doc => doc.value) ||
      selectedDocs
        ?.map(doc => (typeof doc.value === 'object' ? doc.value : null))
        .filter(Boolean) ||
      []) as Product[],
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: 1,
    nextPage: 1,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasHydrated = useRef(false)
  const [page, setPage] = useState(1)

  const scrollToRef = useCallback(() => {
    const { current } = scrollRef
    if (current) {
      // current.scrollIntoView({
      //   behavior: 'smooth',
      // })
    }
  }, [])

  useEffect(() => {
    console.log('Selected Docs:', selectedDocs) // Log selectedDocs
    console.log('Populated Docs:', populatedDocs) // Log populatedDocs
    console.log('Results Docs:', results.docs) // Log results.docs

    if (populateBy === 'selection' && selectedDocs) {
      setResults({
        totalDocs: selectedDocs.length,
        docs: selectedDocs
          .map(doc => (typeof doc.value === 'object' ? doc.value : null))
          .filter(Boolean) as Product[],
        page: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: 1,
        nextPage: 1,
      })
      setIsLoading(false)
      return
    }

    const timer: NodeJS.Timeout = setTimeout(() => {
      if (hasHydrated) {
        setIsLoading(true)
      }
    }, 500)

    const searchQuery = qs.stringify(
      {
        sort,
        where: {
          ...(categoryFilters && categoryFilters?.length > 0
            ? {
                categories: {
                  in:
                    typeof categoryFilters === 'string'
                      ? [categoryFilters]
                      : categoryFilters.map((cat: string) => cat).join(','),
                },
              }
            : {}),
        },
        limit,
        page,
        depth: 1,
      },
      { encode: false },
    )

    const makeRequest = async () => {
      try {
        const req = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/${relationTo}?${searchQuery}`,
        )
        const json = await req.json()
        clearTimeout(timer)
        hasHydrated.current = true

        const { docs } = json as { docs: Product[] }

        if (docs && Array.isArray(docs)) {
          setResults(json)
          setIsLoading(false)
          if (typeof onResultChange === 'function') {
            onResultChange(json)
          }
        }
      } catch (err) {
        console.warn('Error fetching data:', err)
        setIsLoading(false)
        setError(`Unable to load "${relationTo} archive" data at this time.`)
      }
    }

    makeRequest()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [page, categoryFilters, relationTo, onResultChange, sort, limit, selectedDocs, populateBy])

  return (
    <div className={[classes.collectionArchive, className].filter(Boolean).join(' ')}>
      <div ref={scrollRef} className={classes.scrollRef} />
      {!isLoading && error && <div>{error}</div>}
      <Fragment>
        {showPageRange !== false && (
          <div className={classes.pageRange}>
            <PageRange
              totalDocs={results.totalDocs}
              currentPage={results.page}
              collection={relationTo}
              limit={limit}
            />
          </div>
        )}

        <div className={classes.grid}>
          {results.docs && results.docs.length > 0 ? ( // Check if docs is not null and has elements
            results.docs.map((result, index) => (
              <Card key={index} relationTo="products" doc={result} showCategories />
            ))
          ) : (
            <div>No products available</div> // Fallback if no docs
          )}
        </div>

        {results.totalPages > 1 && (
          <Pagination
            className={classes.pagination}
            page={results.page}
            totalPages={results.totalPages}
            onClick={setPage}
          />
        )}
      </Fragment>
    </div>
  )
}
