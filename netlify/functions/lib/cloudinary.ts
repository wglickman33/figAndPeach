import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!configured) {
    cloudinary.config();
    configured = true;
  }
  return cloudinary;
}

export function createUploadSignature(folder: string) {
  const cloud = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder };
  const signature = cloud.utils.api_sign_request(params, cloud.config().api_secret ?? "");
  return {
    timestamp,
    signature,
    apiKey: cloud.config().api_key ?? "",
    cloudName: cloud.config().cloud_name ?? "",
    folder,
  };
}
