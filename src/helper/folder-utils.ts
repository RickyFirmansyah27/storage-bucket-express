import { supabaseClient, bucketName } from "../config/supabase-client";
import { Logger } from ".";

// Helper function to determine folder based on firstName
export function getFolderByFirstName(firstName: string): string {
  if (firstName === "Other") return "public";
  if (firstName === "Zephyrion") return "";
  return firstName;
}

// Create folder if it doesn't exist
export async function createFolderIfNotExists(folder: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .upload(`${folder}/.emptyFolderPlaceholder`, new Blob([''], { type: 'text/plain' }), {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      Logger.error(`Error creating folder ${folder}:`, error);
      return false;
    }

    Logger.info(`Folder ${folder} created successfully`);
    return true;
  } catch (error) {
    Logger.error("Error creating folder:", error);
    return false;
  }
}