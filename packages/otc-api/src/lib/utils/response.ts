import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import type { ErrorResponse } from "../schema.js"
import { bigintReplacer } from "./bigIntReplacer.js"

export function successResponse<T extends Record<string, unknown>>({
  headers,
  status = 200,
  body = {} as T,
}: {
  headers: APIGatewayProxyStructuredResultV2["headers"]
  body?: T
  status?: number
}): APIGatewayProxyStructuredResultV2 {
  return {
    headers,
    statusCode: status,
    body: JSON.stringify(body, bigintReplacer),
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
    error: message,
  }
  return {
    headers,
    statusCode: status,
    body: JSON.stringify(response, bigintReplacer),
  }
}
