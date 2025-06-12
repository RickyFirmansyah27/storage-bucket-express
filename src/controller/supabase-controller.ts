import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import { createReadStream } from "fs";
import mime from "mime-types";
import { BaseResponse, Logger } from "../helper";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

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

// Controller for fetching files
export const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from("asset-manage")
      .list("", { limit: 100, offset: 0 });

    if (error) {
      BaseResponse(res, error.message, "internalServerError");
      return;
    }

    if (!files || files.length === 0) {
      BaseResponse(res, "No files found", "notFound");
      return;
    }

    const filteredFiles = files.filter(
      (file) => file.name !== ".emptyFolderPlaceholder" && file.name !== "public"
    );


    const fileDetails = await Promise.all(
      filteredFiles.map(async (file) => {
        const { data: publicUrlData } = await supabase.storage
          .from("asset-manage")
          .getPublicUrl(`public/${file.name}`);

        const { data } = await supabase.storage
          .from("asset-manage") 
          .info(`${file.name}`);

        return {
          id: file.id,
          name: file.name,
          bucketName: data?.bucketId,
          lastModified: data?.lastModified, 
          url: publicUrlData?.publicUrl,
        };
      })
    );

    BaseResponse(res, "Files fetched successfully", "success", fileDetails);
  } catch (err: any) {
    Logger.error("Get Files Error:", err);
    BaseResponse(res, "Error fetching files", "internalServerError");
  }
};

// Controller for uploading a file
export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      BaseResponse(res, "No files uploaded", "badRequest");
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const storagePath = `${file.originalname}`;
      const { data, error } = await supabase.storage
        .from("asset-manage")
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw new Error(error.message);
      return { path: storagePath, data };
    });

    const results = await Promise.all(uploadPromises);
    BaseResponse(res, "Files uploaded successfully", "success", { files: results });
  } catch (err: any) {
    Logger.error("Server Error:", err.message);
    BaseResponse(res, err.message, "internalServerError");
  }
};

// Controller for downloading a file
export const downloadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filename = req.query.filename;
    const filePath = `${filename}`;
    console.log(filePath);

    const { data } = await supabase.storage
      .from("asset-manage")
      .download(filePath);

    if (!data) {
      BaseResponse(res, "Not Found", "success");
    }

    const arrayBuffer = await data?.arrayBuffer();

    if (arrayBuffer) {
      res.setHeader(
        "Content-Type",
        mime.lookup(filename as string) || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error("Download Server Error:", err);
    BaseResponse(res, err.message, "internalServerError");
  }
};

export const deleteFileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filename = req.query.filename;
    if (!filename) {
      BaseResponse(res, "Filename is required", "badRequest");
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${filename}`,
    });

    await client.send(command);

    Logger.info(`File deleted successfully: ${filename}`);
    BaseResponse(res, "File deleted successfully", "success");
  } catch (error) {
    Logger.error('Error deleting file', error);
    BaseResponse(res, 'Error deleting file', "internalServerError");
  }
};