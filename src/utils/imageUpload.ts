/**
 * Utility to upload images to ImgBB
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadImageToImgBB = async (file) => {
  if (!file) return "";
  
  const IMGBB_API_KEY = "3762ab13c55ff6c4cfba5b63dba662dd";
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Image upload failed");
    }
  } catch (err) {
    console.error("ImgBB Upload Error:", err);
    throw err;
  }
};
