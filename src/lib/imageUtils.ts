/**
 * Downloads an image from a URL or base64 data
 */
export const downloadImage = async (
  imageUrl: string,
  filename: string = "asuran-ai-image"
): Promise<void> => {
  try {
    let blob: Blob;

    // Check if it's a base64 data URL
    if (imageUrl.startsWith("data:")) {
      const response = await fetch(imageUrl);
      blob = await response.blob();
    } else {
      // For regular URLs, fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      blob = await response.blob();
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Determine file extension from blob type
    const mimeType = blob.type;
    let extension = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    } else if (mimeType.includes("webp")) {
      extension = "webp";
    } else if (mimeType.includes("gif")) {
      extension = "gif";
    }

    link.download = `${filename}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
};

/**
 * Converts a base64 image to a Blob
 */
export const base64ToBlob = (base64: string, mimeType: string = "image/png"): Blob => {
  // Remove the data URL prefix if present
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};
