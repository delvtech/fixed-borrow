import type {
  APIGatewayProxyStructuredResultV2,
  LambdaFunctionURLEvent,
} from "aws-lambda"
import { DELETE } from "./handlers/DELETE/handler.js"
import { GET } from "./handlers/GET/handler.js"
import { POST } from "./handlers/POST/handler.js"
import { PUT } from "./handlers/PUT/handler.js"
import type { HandlerParams } from "./types.js"
import { errorResponse, successResponse } from "./lib/utils/response.js"

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(/,\s*/) || []
const bucketName = process.env.BUCKET_NAME

if (!bucketName) {
  throw new Error("BUCKET_NAME environment variable is required")
}

export const handler = async (
  event: LambdaFunctionURLEvent
): Promise<APIGatewayProxyStructuredResultV2> => {
  const origin = event.headers.origin || event.headers.Origin

  if (!origin || !allowedOrigins.includes(origin)) {
    return errorResponse({
      headers: {},
      status: 403,
      message: "Forbidden",
    })
  }

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  }
  const params: HandlerParams = {
    event,
    responseHeaders: headers,
    bucketName,
  }

  try {
    switch (event.requestContext.http.method) {
      // CORS preflight //
      case "OPTIONS":
        return successResponse({ headers })

      case "GET":
        return GET(params)

      case "POST":
        return POST(params)

      case "PUT":
        return PUT(params)

      case "DELETE":
        return DELETE(params)

      default:
        return errorResponse({
          headers,
          status: 405,
          message: "Method not allowed",
        })
    }
  } catch (error) {
    console.error("Error:", error)
    return errorResponse({
      headers,
      status: 500,
      message: "Internal server error",
    })
  }
}
