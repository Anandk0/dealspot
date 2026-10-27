/**
 * Client-side image compression utility.
 *
 * Mobile cameras produce 3-10 MB photos. The app proxies uploads through
 * Vercel serverless functions which enforce a 4.5 MB body-size limit. Even
 * when the proxy isn't the bottleneck, smaller files mean faster Cloudinary
 * uploads and less data usage for users.
 *
 * Strategy: resize to a max dimension of 1600px and re-encode as JPEG at
 * quality 0.80 — strikes an optimal balance between crisp detail and compact size
 * (typically compresses a 5-8 MB phone photo down to 200-350 KB).
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.80;
const COMPRESS_THRESHOLD = 300 * 1024; // 300 KB — compress anything above this

/**
 * Compress a single image File. Returns a new File (JPEG) that is typically
 * 5-20x smaller than the original camera capture.
 *
 * Falls back to the original file if Canvas/Blob APIs are unavailable
 * or on any decode/load error.
 */
export async function compressImage(file: File): Promise<File> {
  // If already under 300KB, no need to touch it
  if (file.size <= COMPRESS_THRESHOLD) return file;

  // Skip non-image types
  if (!file.type || !file.type.startsWith("image/")) return file;

  return new Promise<File>((resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve(file);
      return;
    }

    const img = new Image();

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
    };

    img.onload = () => {
      cleanup();
      try {
        let { width, height } = img;

        // Scale down if either dimension exceeds the cap.
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Only use compressed if it's actually smaller
            if (blob.size >= file.size) {
              resolve(file);
              return;
            }
            const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
            resolve(new File([blob], name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          JPEG_QUALITY,
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Compress an array of image files in parallel.
 */
export async function compressImages(files: File[]): Promise<File[]> {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map(compressImage));
}
