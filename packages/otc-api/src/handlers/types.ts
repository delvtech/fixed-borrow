import type { LambdaFunctionURLEvent } from "aws-lambda"

export interface HandlerParams {
  event: LambdaFunctionURLEvent
  bucketName: string
  responseHeaders: Record<string, string>
}
