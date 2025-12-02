export function getFileExtensionFromMimeType(mimeType: string) {
  const extension = mimeMap[mimeType as keyof typeof mimeMap];
  if (extension) {
    return extension;
  }
  // Try to extract extension from MIME type (e.g., "image/png" -> "png")
  const parts = mimeType.split("/");
  if (parts.length === 2) {
    const subtype = parts[1].split(";")[0].split("+")[0]; // Handle "image/svg+xml" and "text/html; charset=utf-8"
    return subtype;
  }

  // Default fallback
  return "bin";
}

const mimeMap = {
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/x-icon": "ico",

  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "text/html": "html",
  "text/css": "css",
  "application/rtf": "rtf",

  // Archives
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
  "application/x-7z-compressed": "7z",
  "application/x-tar": "tar",
  "application/gzip": "gz",

  // Audio
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "weba",
  "audio/aac": "aac",
  "audio/flac": "flac",

  // Video
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/x-msvideo": "avi",
  "video/quicktime": "mov",

  // Code/Data
  "application/json": "json",
  "application/xml": "xml",
  "text/xml": "xml",
  "application/javascript": "js",
  "text/javascript": "js",

  // Other
  "application/octet-stream": "bin",
};
