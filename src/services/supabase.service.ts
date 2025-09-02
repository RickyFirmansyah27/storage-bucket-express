import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Logger } from "../helper";
import {
  supabaseClient,
  s3Client,
  bucketName
} from "../config/supabase-client";
import {
  getFolderByFirstName,
  createFolderIfNotExists
} from "../helper/folder-utils";
import { commandWithParams } from "../config/dbPoolInfra";

export class SupabaseService {
  private supabase;
  private s3Client;
  private bucketName = bucketName;

  constructor() {
    // Assign clients from config
    this.supabase = supabaseClient;
    this.s3Client = s3Client;
  }


  // Get files from storage
  async getFiles(firstName: string) {
    try {
      Logger.info(`getFiles called with firstName: ${firstName}`);

      // Database health check
      try {
        Logger.info('Performing database health check...');
        const healthCheck = await commandWithParams('SELECT 1 as health_check', []);
        if (healthCheck && healthCheck.length > 0) {
          Logger.info('Database health check passed');
        }
      } catch (dbError: any) {
        Logger.error('Database health check failed:', dbError);
        return {
          success: false,
          message: 'Database connection failed',
          error: dbError
        };
      }

      const folder = getFolderByFirstName(firstName);

      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(folder, { limit: 100, offset: 0 });

      if (error) {
        // If folder doesn't exist and it's not "Other", create the folder
        if (firstName !== "Other" && firstName !== "Zephyrion") {
          const folderCreated = await createFolderIfNotExists(folder);
          if (folderCreated) {
            return {
              success: true,
              data: { files: [], firstName, folderCreated: true },
              message: "Folder created successfully"
            };
          }
        }
        
        return {
          success: false,
          message: error.message,
          error: error
        };
      }

      if (!files || files.length === 0) {
        // If no files found and it's not "Other" or "Zephyrion", create the folder
        if (firstName !== "Other" && firstName !== "Zephyrion") {
          const folderCreated = await createFolderIfNotExists(folder);
          if (folderCreated) {
            return {
              success: true,
              data: { files: [], firstName, folderCreated: true },
              message: "Folder created successfully"
            };
          } else {
            return {
              success: false,
              message: "Error creating folder"
            };
          }
        }
        
        return {
          success: false,
          message: "No files found"
        };
      }

      const filteredFiles = files.filter(
        (file) => file.name !== ".emptyFolderPlaceholder" && file.name !== "public"
      );

      const fileDetails = await Promise.all(
        filteredFiles.map(async (file) => {
          const { data: publicUrlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(`${folder ? folder + "/" : ""}${file.name}`);

          const { data } = await this.supabase.storage
            .from(this.bucketName)
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

      return {
        success: true,
        data: { files: fileDetails, firstName },
        message: "Files fetched successfully"
      };
    } catch (error: any) {
      Logger.error("Get Files Error:", error);
      return {
        success: false,
        message: "Error fetching files",
        error: error
      };
    }
  } 

  // Upload files to storage
  async uploadFiles(files: Express.Multer.File[], firstName: string) {
    try {
      Logger.info(`uploadFile called with firstName: ${firstName}`);

      const folder = getFolderByFirstName(firstName);

      if (!files || files.length === 0) {
        return {
          success: false,
          message: "No files uploaded"
        };
      }

      const uploadPromises = files.map(async (file) => {
        const storagePath = `${folder ? folder + "/" : ""}${file.originalname}`;
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (error) throw new Error(error.message);
        return { path: storagePath, data };
      });

      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        data: { files: results, firstName, bucketName: this.bucketName, folder },
        message: "Files uploaded successfully"
      };
    } catch (error: any) {
      Logger.error("Upload Files Error:", error.message);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  // Download file from storage
  async downloadFile(filename: string, firstName: string) {
    try {
      Logger.info(`downloadFile called with firstName: ${firstName}`);

      const folder = getFolderByFirstName(firstName);
      const filePath = `${folder ? folder + "/" : ""}${filename}`;

      const { data } = await this.supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (!data) {
        return {
          success: false,
          message: "File not found"
        };
      }

      const arrayBuffer = await data?.arrayBuffer();

      return {
        success: true,
        data: {
          buffer: arrayBuffer ? Buffer.from(arrayBuffer) : null,
          filename: filename
        },
        message: "File downloaded successfully"
      };
    } catch (error: any) {
      Logger.error("Download File Error:", error);
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  // Delete file from storage
  async deleteFile(filename: string, firstName: string) {
    try {
      Logger.info(`deleteFile called with firstName: ${firstName}`);

      const folder = getFolderByFirstName(firstName);

      if (!filename) {
        return {
          success: false,
          message: "Filename is required"
        };
      }

      // Only use S3 client when firstName is "Other"
      if (firstName === "Other") {
        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || this.bucketName,
          Key: `${folder ? folder + "/" : ""}${filename}`,
        });

        await this.s3Client.send(command);
      } else {
        // Use Supabase storage for other users
        const filePath = `${folder ? folder + "/" : ""}${filename}`;
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .remove([filePath]);

        if (error) {
          Logger.error('Error deleting file from Supabase:', error);
          return {
            success: false,
            message: 'Error deleting file',
            error: error
          };
        }
      }

      Logger.info(`File deleted successfully: ${filename}`);
      return {
        success: true,
        data: { filename, firstName, bucketName: this.bucketName, folder },
        message: "File deleted successfully"
      };
    } catch (error: any) {
      Logger.error('Delete File Error:', error);
      return {
        success: false,
        message: 'Error deleting file',
        error: error
      };
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();