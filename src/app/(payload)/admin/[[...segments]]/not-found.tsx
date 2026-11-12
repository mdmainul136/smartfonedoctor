import { NotFoundPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap'

export const generateMetadata = async ({ params, searchParams }: any) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  return generatePageMetadata({
    config,
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  })
}

const NotFound = async ({ params, searchParams }: any) => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  return NotFoundPage({
    config,
    params: resolvedParams,
    searchParams: resolvedSearchParams,
    importMap,
  })
}

export default NotFound



