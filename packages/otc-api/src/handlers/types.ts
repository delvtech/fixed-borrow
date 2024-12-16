import type { LambdaFunctionURLEvent } from "aws-lambda"

type HandlerBody = string | Record<string, unknown> | undefined
type HandlerQuery = Record<string, string | undefined>

export type HandlerEvent<
  TBody extends HandlerBody = HandlerBody,
  TQuery extends HandlerQuery = HandlerQuery,
> = Omit<LambdaFunctionURLEvent, "body" | "queryStringParameters"> & {
  body?: TBody | string
  queryStringParameters?: TQuery
}

export interface HandlerParams<
  TBody extends HandlerBody = HandlerBody,
  TQuery extends HandlerQuery = HandlerQuery,
> {
  event: HandlerEvent<TBody, TQuery>
  bucketName: string
  responseHeaders: Record<string, string>
}
