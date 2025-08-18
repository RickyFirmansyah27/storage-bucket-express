import { Request, Response } from "express";
import mime from "mime-types";
import { BaseResponse } from "../helper";
import { supabaseService } from "../services/supabase.service";

// Controller for fetching files
export const getFiles = async (req: Request, res: Response): Promise<void> => {
  const firstName = req.query.firstName as string | undefined;
  if (!firstName) {
    BaseResponse(res, "firstName is required", "badRequest");
    return;
  }

  const result = await supabaseService.getFiles(firstName);
  
  if (result.success) {
    BaseResponse(res, result.message, "success", result.data);
  } else {
    const statusCode = result.message === "No files found" ? "notFound" : "internalServerError";
    BaseResponse(res, result.message, statusCode);
  }
};

// Controller for uploading a file
export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  const firstName = req.body.firstName as string | undefined;
  
  if (!firstName) {
    BaseResponse(res, "firstName is required", "badRequest");
    return;
  }

  const result = await supabaseService.uploadFiles(files, firstName);
  
  if (result.success) {
    BaseResponse(res, result.message, "success", result.data);
  } else {
    BaseResponse(res, result.message, "badRequest");
  }
};

// Controller for downloading a file
export const downloadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filename = req.query.filename as string;
  const firstName = req.query.firstName as string | undefined;
  
  if (!firstName) {
    BaseResponse(res, "firstName is required", "badRequest");
    return;
  }

  const result = await supabaseService.downloadFile(filename, firstName);
  
  if (result.success && result.data?.buffer) {
    res.setHeader(
      "Content-Type",
      mime.lookup(filename) || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.send(result.data.buffer);
  } else {
    BaseResponse(res, result.message || "File not found", "notFound");
  }
};

export const deleteFileHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filename = req.query.filename as string;
  const firstName = req.query.firstName as string | undefined;
  
  if (!firstName) {
    BaseResponse(res, "firstName is required", "badRequest");
    return;
  }

  const result = await supabaseService.deleteFile(filename, firstName);
  
  if (result.success) {
    BaseResponse(res, result.message, "success", result.data);
  } else {
    const statusCode = result.message === "Filename is required" ? "badRequest" : "internalServerError";
    BaseResponse(res, result.message, statusCode);
  }
};