import { Query } from 'mongoose'
import type { Request } from 'express'

class APIFeatures {
  query: Query<any[], any>
  queryString: Record<string, any>

  constructor(query: Query<any[], any>, req: Request) {
    this.query = query
    const aliasQuery = (req as any).aliasQuery || {}
    const queryObj = { ...req.query, ...aliasQuery } as Record<string, any>
    this.queryString = queryObj
  }

  filter() {
    // Filtering
    const filterObj = { ...this.queryString }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach((el) => delete filterObj[el])

    // Advanced Filtering
    const parsedObj: Record<string, any> = {}
    for (const key in filterObj) {
      const match = key.match(/^(\w+)\[(\w+)\]$/)
      if (match) {
        const field = match[1] as string
        const operator = match[2] as string
        parsedObj[field] = {
          ...parsedObj[field],
          [operator]: this.queryString[key],
        }
      } else {
        parsedObj[key] = this.queryString[key]
      }
    }
    let queryStr = JSON.stringify(parsedObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }

  sort() {
    if (this.queryString.sort) {
      console.log('🚀 ~ APIFeatures ~ ', {
        sort: this.queryString.sort,
      })
      const sortBy = (this.queryString.sort as string).split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    const page = Number(this.queryString.page) || 1
    const limit = Number(this.queryString.limit) || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}

export default APIFeatures
