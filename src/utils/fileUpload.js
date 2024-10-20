import {
  ref as storageRef,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/services/firebase";

export async function fileUpload(file, directory) {
  const isImage = file.raw.type.startsWith("image/");

  if (!isImage) {
    throw new Error("You can only upload image files!");
  }

  try {
    const fileRef = storageRef(storage, `${directory}/${file.raw.name}`);

    await uploadBytes(fileRef, file.raw);

    const fileUrl = await getDownloadURL(fileRef);

    return fileUrl;
  } catch (error) {
    console.error("err", error);
    throw new Error("File upload failed!");
  }
}
