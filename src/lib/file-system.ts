import { environment } from "@raycast/api";
import { promises as fs } from "fs";
import * as path from "path";
import * as crypto from "crypto";

export const IMAGES_DIR = path.join(environment.supportPath, "images");

/**
 * Creates the IMAGES_DIR recursively if it doesn't exist.
 */
export async function ensureImageDir(): Promise<void> {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

/**
 * Writes an image buffer to disk.
 * @param buffer The image buffer.
 * @param id The unique identifier for the image.
 * @param format The image format (e.g., 'png', 'jpg').
 * @returns The filename of the saved image.
 */
export async function saveImage(
  buffer: Buffer,
  id: string,
  format: string,
): Promise<string> {
  await ensureImageDir();
  const filename = `${id}.${format}`;
  const filePath = path.join(IMAGES_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return filename;
}

/**
 * Removes an image file from disk. Silently ignores if the file doesn't exist.
 * @param filename The filename to delete.
 */
export async function deleteImage(filename: string): Promise<void> {
  const filePath = path.join(IMAGES_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

/**
 * Returns the absolute path for an image filename.
 * @param filename The image filename.
 * @returns The absolute path.
 */
export function getImagePath(filename: string): string {
  return path.join(IMAGES_DIR, filename);
}

/**
 * Computes the SHA-256 hash of a buffer.
 * @param buffer The image buffer.
 * @returns The hash as a hex string.
 */
export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Detects the image format from magic bytes.
 * @param buffer The image buffer.
 * @returns The format string ('png', 'jpg', 'gif', 'webp') or null if unrecognized.
 */
export function detectFormat(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 12) return null;

  // PNG: [0x89, 0x50, 0x4E, 0x47]
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  // JPEG: [0xFF, 0xD8, 0xFF]
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer.toString("ascii", 0, 3) === "GIF" &&
    buffer.toString("ascii", 3, 6).match(/8[79]a/)
  ) {
    return "gif";
  }

  // WebP: RIFF...WEBP
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

/**
 * Parses image dimensions by reading file headers directly.
 * @param buffer The image buffer.
 * @returns An object with width and height, or null if unrecognized.
 */
export function getImageDimensions(
  buffer: Buffer,
): { width: number; height: number } | null {
  if (!buffer || buffer.length < 24) return null;

  const format = detectFormat(buffer);

  switch (format) {
    case "png":
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };

    case "jpg": {
      let offset = 2; // Skip 0xFF 0xD8
      while (offset < buffer.length - 8) {
        const marker = buffer.readUInt16BE(offset);
        offset += 2;

        if (marker === 0xffc0 || marker === 0xffc2) {
          // SOF0 or SOF2
          return {
            height: buffer.readUInt16BE(offset + 3),
            width: buffer.readUInt16BE(offset + 5),
          };
        }

        // Skip to next marker
        const length = buffer.readUInt16BE(offset);
        offset += length;
      }
      return null;
    }

    case "gif":
      return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
      };

    case "webp": {
      if (buffer.length < 30) return null;
      const chunkType = buffer.toString("ascii", 12, 16);
      if (chunkType === "VP8 ") {
        // Lossy
        const widthAndScale = buffer.readUInt16LE(26);
        const heightAndScale = buffer.readUInt16LE(28);
        return {
          width: widthAndScale & 0x3fff,
          height: heightAndScale & 0x3fff,
        };
      } else if (chunkType === "VP8L") {
        // Lossless
        const bits = buffer.readUInt32LE(21);
        return {
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      } else if (chunkType === "VP8X") {
        // Extended
        const width = (buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) + 1;
        const height =
          (buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) + 1;
        return { width, height };
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Retrieves storage statistics.
 * @returns An object containing total file count and total size in bytes.
 */
export async function getStorageStats(): Promise<{
  totalCount: number;
  totalSizeBytes: number;
}> {
  try {
    const files = await fs.readdir(IMAGES_DIR);
    let totalSizeBytes = 0;
    let totalCount = 0;

    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSizeBytes += stats.size;
        totalCount++;
      }
    }

    return { totalCount, totalSizeBytes };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { totalCount: 0, totalSizeBytes: 0 };
    }
    throw error;
  }
}
