/* eslint-disable no-console */
import React from 'react'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Product, Product as ProductType } from '../../../../payload/payload-types'
import { fetchDoc } from '../../../_api/fetchDoc'
import { fetchDocs } from '../../../_api/fetchDocs'
import { Blocks } from '../../../_components/Blocks'
import { PaywallBlocks } from '../../../_components/PaywallBlocks'
import { ProductHero } from '../../../_heros/Product'
import { generateMeta } from '../../../_utilities/generateMeta'

export const dynamic = 'force-dynamic'

export default async function Product({ params: { slug } }) {
  const { isEnabled: isDraftMode } = draftMode()

  let product: Product | null = null

  try {
    product = await fetchDoc<Product>({
      collection: 'products',
      slug,
      draft: isDraftMode,
    })
    console.log('Fetched product:', product)
  } catch (error) {
    console.error('Error fetching product:', error) // eslint-disable-line no-console
  }

  if (!product) {
    console.warn('Product not found, redirecting to 404') // eslint-disable-line no-console
    notFound()
  }

  const { relatedProducts } = product

  console.log('Related products:', relatedProducts)

  return (
    <>
      <ProductHero product={product} />
      {product?.enablePaywall && <PaywallBlocks productSlug={slug as string} disableTopPadding />}
      <Blocks
        disableTopPadding
        blocks={[
          {
            blockType: 'relatedProducts',
            blockName: 'Related Product',
            relationTo: 'products',
            introContent: [
              {
                type: 'h3',
                children: [
                  {
                    text: 'Related Products',
                  },
                ],
              },
            ],
            docs: relatedProducts,
          },
        ]}
      />
    </>
  )
}

export async function generateStaticParams() {
  try {
    const products = await fetchDocs<ProductType>('products')
    console.log('Static params for products:', products)
    return products?.map(({ slug }) => slug)
  } catch (error) {
    console.error('Error generating static params:', error) // eslint-disable-line no-console
    return []
  }
}

export async function generateMetadata({ params: { slug } }): Promise<Metadata> {
  const { isEnabled: isDraftMode } = draftMode()

  let product: Product | null = null

  try {
    product = await fetchDoc<Product>({
      collection: 'products',
      slug,
      draft: isDraftMode,
    })
    console.log('Product metadata:', product)
  } catch (error) {
    console.error('Error generating metadata:', error) // eslint-disable-line no-console
  }

  return generateMeta({ doc: product })
}
