import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  S3Client,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const supabaseClient: SupabaseClient = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

export const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

export const bucketName = "asset-manage";