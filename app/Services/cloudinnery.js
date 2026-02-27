
const CLOUDINARY_CLOUD_NAME = 'dvvii6ei6';
const CLOUDINARY_API_KEY = '862815136766828';
const CLOUDINARY_API_SECRET = 'GlA46IWm1gOHSkKoSbRwfjGm07I';

export const uploadToCloudinary = async (uri, folder = 'shops') => {
  try {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'business_directory'); 
    data.append('folder', 'business-app'); // Specifying the asset folder
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    data.append('api_key', CLOUDINARY_API_KEY);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
      }
    );

    const responseText = await response.text();
    console.log('Cloudinary Response:', responseText);

    try {
        const result = JSON.parse(responseText);
        if (response.ok) {
            return result.secure_url;
        } else {
            console.error("Cloudinary Upload Error:", result);
            throw new Error(result.error?.message || "Upload failed");
        }
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid response from Cloudinary");
    }
  } catch (error) {
    console.error("Upload function error:", error);
    return null;
  }
};