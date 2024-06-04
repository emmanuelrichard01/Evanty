import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Generate React hooks and helpers for file uploading using the custom file router
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

