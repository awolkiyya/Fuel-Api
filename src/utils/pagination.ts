export interface PaginationQuery {
    page: number
    limit: number
    skip: number
  }
  
  export const getPagination = (query: any): PaginationQuery => {
    const page = Math.max(Number(query.page) || 1, 1)
    const limit = Math.min(Number(query.limit) || 10, 100) // cap limit
    const skip = (page - 1) * limit
  
    return { page, limit, skip }
  }
  export const buildMeta = (
    page: number,
    limit: number,
    total: number
  ) => {
    const totalPages = Math.ceil(total / limit)
  
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }