// Wrapper for browser-image-compression
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 1, maxWidthOrHeight = 512): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}
