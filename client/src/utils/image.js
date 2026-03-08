import { baseURL } from "../api/api";

export const DEFAULT_PROFILE_IMAGE = "https://bootdey.com/img/Content/avatar/avatar1.png";

export const resolveImageUrl = (imagePathOrUrl, fallback = DEFAULT_PROFILE_IMAGE) => {
  if (!imagePathOrUrl) return fallback;
  if (/^https?:\/\//i.test(imagePathOrUrl)) return imagePathOrUrl;
  return `${baseURL}/${String(imagePathOrUrl).replace(/^\/+/, "")}`;
};
