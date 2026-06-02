export interface BaseResponse<T = unknown> {
  code: number
  message: string
  msg?: string
  data: T
  timestamp?: number
}
