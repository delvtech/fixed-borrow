import { OtcClient } from "otc-api"

export const otc = new OtcClient(import.meta.env.VITE_OTC_API_URL)
