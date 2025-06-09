import { BaseResponse, Logger } from "../helper";
import {
  S3Client,
  ListObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Context } from "hono";
import dotenv from "dotenv";
dotenv.config();

const client = new S3Client({
  forcePathStyle: true,
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

// Define FileObject interface
interface FileObject {
  name: string;
  size: number;
  lastModified: Date;
  url: string;
}

const contextLogger = "S3Controller";
export const getFilesHanlder = async (c: Context) => {
  try {
    const command = new ListObjectsCommand({
      Bucket: process.env.S3_BUCKET_NAME,
    });

    const response = await client.send(command);
    const files: FileObject[] = (response.Contents || []).map((item) => ({
      name: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
      url: `https://ojjqadkskrmznmcggnqe.supabase.co/storage/v1/s3/${item.Key}`,
    }));
    Logger.info(`${contextLogger} | getFiles`, files);
    return BaseResponse(c, "Files fetched successfully", "success", files);
  } catch (error) {
    Logger.error(`${contextLogger} | getFiles`, error);
    return BaseResponse(c, "Error fetching files", "internalServerError");
  }
};

export const uploadFileHandler = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return c.json({ error: "No file provided or invalid file." }, 400);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.name,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    });

    await client.send(command);

    const result = {
      success: true,
      url: `https://ojjqadkskrmznmcggnqe.supabase.co/storage/v1/s3/${file.name}`,
      key: file.name,
    };
    Logger.info(`${contextLogger} | getFiles`, result);
    return BaseResponse(c, "Files fetched successfully", "success", result);
  } catch (error) {
    Logger.error(`${contextLogger} | getFiles`, error);
    return BaseResponse(c, "Error fetching files", "internalServerError");
  }
};
