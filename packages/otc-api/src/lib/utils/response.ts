import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import type { ErrorResponse } from "../schema.js"
import { bigintReplacer } from "./bigIntReplacer.js"

// Use distribution to remove "success" from the response without merging unions
// and make it optional.
type SuccessResponseBody<T extends Record<string, unknown>> = {
  [K in keyof T as K extends "success" ? never : K]: T[K]
} & {
  success?: boolean
}

export function successResponse<T extends Record<string, unknown>>({
  headers,
  status = 200,
  body = {} as T,
}: {
  headers: APIGatewayProxyStructuredResultV2["headers"]
  body?: SuccessResponseBody<T>
  status?: number
}): APIGatewayProxyStructuredResultV2 {
  return {
    headers,
    statusCode: status,
    body: JSON.stringify(
      {
        success: true,
        ...body,
      },
      bigintReplacer
    ),
  }
}

export function errorResponse({
  headers,
  status = 400,
  message,
}: {
  headers: APIGatewayProxyStructuredResultV2["headers"]
  message: string
  status?: number
}): APIGatewayProxyStructuredResultV2 {
  const response: ErrorResponse = {
    success: false,
    error: message,
  }
  return {
    headers,
    statusCode: status,
    body: JSON.stringify(response, bigintReplacer),
  }
}
