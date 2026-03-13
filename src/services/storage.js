import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Upload a license image/PDF to Firebase Storage
 * Returns the download URL of the uploaded file
 */
export const uploadLicenseImage = async (uid, fileUri) => {
  // Fetch the file and convert to blob
  const response = await fetch(fileUri);
  const blob = await response.blob();

  // Determine file extension from URI
  const extension = fileUri.split(".").pop() || "jpg";
  const storageRef = ref(storage, `licenses/${uid}/license.${extension}`);

  // Upload the file
  const uploadTask = await uploadBytesResumable(storageRef, blob);

  // Get and return the download URL
  const downloadURL = await getDownloadURL(uploadTask.ref);
  return downloadURL;
};
