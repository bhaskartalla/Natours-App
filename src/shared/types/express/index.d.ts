import { IUser } from '../../models/userModel'

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      requestTime?: string
    }
  }
}

declare module 'mongoose' {
  interface Query<
    ResultType,
    DocType,
    THelpers,
    RawDocType,
    QueryOp,
    TInstanceMethods,
  > {
    start?: number
    r?: any
  }
}
