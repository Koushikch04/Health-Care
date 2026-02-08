import fs from "fs/promises";
import path from "path";

/**
 * Creates a backup of any Mongoose model to a JSON file.
 * @param {mongoose.Model} Model - The Mongoose model to back up.
 */
export const backupModelData = async (Model) => {
  try {
    const modelName = Model.modelName;
    const backupDir = "./backups";
    const filePath = path.join(
      backupDir,
      `${modelName.toLowerCase()}_backup.json`,
    );

    // Ensure the backup directory exists
    await fs.mkdir(backupDir, { recursive: true });

    // Fetch all documents as plain JavaScript objects (POJOs)
    // .lean() makes this significantly faster and memory-efficient
    const data = await Model.find().lean();

    // Write the array of documents to a JSON file with 2-space indentation
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    console.log(
      `✅ Success: ${data.length} documents from "${modelName}" backed up to ${filePath}`,
    );
    return { path: filePath, count: data.length };
  } catch (error) {
    console.error(`❌ Backup failed for ${Model.modelName}:`, error.message);
    throw error;
  }
};
