export interface ApiResponse<T = any> {
  status: "success" | "error"
  message: string
  data?: T
  errors?: string[]
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  results: number
  data: T[]
  pagination: PaginationMeta
}

export interface BaseFilters {
  page?: number
  limit?: number
  sort?: string
  search?: string
}
