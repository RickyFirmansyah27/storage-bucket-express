import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import { createReadStream } from "fs";
import mime from "mime-types";
import { BaseResponse, Logger } from "../helper";

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_KEY ?? ""
);

// Controller for fetching files
export const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: files, error } = await supabase.storage
      .from("asset-manage")
      .list("public", { limit: 100, offset: 0 });

    if (error) {
      BaseResponse(res, error.message, "internalServerError");
      return;
    }

    if (!files || files.length === 0) {
      BaseResponse(res, "No files found", "notFound");
      return;
    }

    const filteredFiles = files.filter(
      (file) => file.name !== ".emptyFolderPlaceholder"
    );

    const fileUrls = await Promise.all(
      filteredFiles.map(async (file) => {
        const { data } = await supabase.storage
          .from("asset-manage")
          .getPublicUrl(`public/${file.name}`);
        return {
          name: file.name,
          url: data.publicUrl,
        };
      })
    );

    BaseResponse(res, "Files fetched successfully", "success", fileUrls);
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
    const file = req.file;
    if (!file) {
      BaseResponse(res, "No file uploaded", "badRequest");
      return;
    }

    const originalName = file.originalname;
    const storagePath = `public/${originalName}`;

    const { data, error } = await supabase.storage
      .from("asset-manage")
      .upload(storagePath, createReadStream(file.path), {
        contentType: file.mimetype,
        upsert: true,
      });

    // Cleanup temporary file
    await fs.unlink(file.path);

    if (error) {
      Logger.error("Upload error:", error.message);
      BaseResponse(res, error.message, "internalServerError");
      return;
    }

    BaseResponse(res, "Upload successful", "success", {
      path: storagePath,
      data,
    });
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
    const filePath = `public/${filename}`;
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
