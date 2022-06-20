import { SortOrderType } from '../utils/types'
import { API_URL } from '../config/variables'
import { Report } from '../models'

export type ReportFilterType = {
  reporter?: string
  reported?: string
  activity?: string
  shop?: string
  product?: string
  reportType?: 'all' | 'activity' | 'shop' | 'product'
}

export type ReportSort = {
  sortBy: 'created_at' | 'updated_at'
  sortOrder: SortOrderType
}

type GetReportsParamTypes = {
  search?: string
  filter?: ReportFilterType
  sort?: ReportSort
  limit?: number
  page?: number
  community?: string
}

export type ReportsResponse = {
  pages: number
  totalItems: number
  data: (Report & { id: string })[]
}

export const getReports = async (
  {
    search = '',
    filter = {},
    sort = { sortBy: 'created_at', sortOrder: 'desc' },
    limit = 10,
    page = 0,
    community,
  }: GetReportsParamTypes,
  firebaseToken: string
): Promise<ReportsResponse | undefined> => {
  if (filter.reportType === 'all') {
    delete filter.reportType
  }
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    ...filter,
  }
  if (search) {
    params.q = search
  }
  if (community) {
    params.community = community
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/reports?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}
