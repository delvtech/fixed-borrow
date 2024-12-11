import { z } from "zod"
import { PostRequestSchema, PostResponseSchema } from "../POST/schema.js"

export const PutRequestSchema = PostRequestSchema
export type PutRequest = z.infer<typeof PutRequestSchema>

export const PutResponseSchema = PostResponseSchema
export type PutResponse = z.infer<typeof PutResponseSchema>
