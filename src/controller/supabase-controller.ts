import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import mime from "mime-types";
import { BaseResponse, Logger } from "../helper";

import {
  S3Client,
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
    const firstName = req.query.firstName as string | undefined;
    if (!firstName) {
      BaseResponse(res, "firstName is required", "badRequest");
      return;
    }
    Logger.info(`getFiles called with firstName: ${firstName}`);
    const bucketName = "asset-manage";
    const folder = firstName === "Zephyrion" ? "" : "public";

    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folder, { limit: 100, offset: 0 });

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
          .from(bucketName)
          .getPublicUrl(`${folder ? folder + "/" : ""}${file.name}`);

        const { data } = await supabase.storage
          .from(bucketName)
          .info(`${folder ? folder + "/" : ""}${file.name}`);

        return {
          id: file.id,
          name: file.name,
          bucketName: data?.bucketId,
          lastModified: data?.lastModified,
          url: publicUrlData?.publicUrl,
        };
      })
    );

    BaseResponse(
      res,
      "Files fetched successfully",
      "success",
      { files: fileDetails, firstName }
    );
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
    const firstName = req.body.firstName as string | undefined;
    if (!firstName) {
      BaseResponse(res, "firstName is required", "badRequest");
      return;
    }
    Logger.info(`uploadFile called with firstName: ${firstName}`);
    const bucketName = "asset-manage";
    const folder = firstName === "Zephyrion" ? "" : "public";

    if (!files || files.length === 0) {
      BaseResponse(res, "No files uploaded", "badRequest");
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const storagePath = `${folder ? folder + "/" : ""}${file.originalname}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw new Error(error.message);
      return { path: storagePath, data };
    });

    const results = await Promise.all(uploadPromises);
    BaseResponse(
      res,
      "Files uploaded successfully",
      "success",
      { files: results, firstName, bucketName, folder }
    );
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
    const firstName = req.query.firstName as string | undefined;
    if (!firstName) {
      BaseResponse(res, "firstName is required", "badRequest");
      return;
    }
    Logger.info(`downloadFile called with firstName: ${firstName}`);
    const bucketName = "asset-manage";
    const folder = firstName === "Zephyrion" ? "" : "public";
    const filePath = `${folder ? folder + "/" : ""}${filename}`;

    const { data } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (!data) {
      BaseResponse(res, "Not Found", "success");
      return;
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
    const firstName = req.query.firstName as string | undefined;
    if (!firstName) {
      BaseResponse(res, "firstName is required", "badRequest");
      return;
    }
    Logger.info(`deleteFileHandler called with firstName: ${firstName}`);
    const bucketName = "asset-manage";
    const folder = firstName === "Zephyrion" ? "" : "public";
    if (!filename) {
      BaseResponse(res, "Filename is required", "badRequest");
      return;
    }

    // If using S3, you may need to adjust the bucket logic here as well.
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || bucketName,
      Key: `${folder ? folder + "/" : ""}${filename}`,
    });

    await client.send(command);

    Logger.info(`File deleted successfully: ${filename}`);
    BaseResponse(res, "File deleted successfully", "success", { filename, firstName, bucketName, folder });
  } catch (error) {
    Logger.error('Error deleting file', error);
    BaseResponse(res, 'Error deleting file', "internalServerError");
  }
};