import type { LambdaFunctionURLEvent } from "aws-lambda"

export type HandlerEvent = Omit<LambdaFunctionURLEvent, "body"> & {
  body?: string | Record<string, unknown>
}

export interface HandlerParams {
  event: HandlerEvent
  bucketName: string
  responseHeaders: Record<string, string>
}
