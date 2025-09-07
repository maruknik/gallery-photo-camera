import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from './cloudinaryConfig';

const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append('file', { uri: imageUri, type: 'image/jpeg', name: 'upload.jpg' });
  data.append('upload_preset', 'ml_default'); // Replace with your upload preset
  data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'post',
      body: data,
    });
    const result = await response.json();
    console.log('Cloudinary upload result:', result);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return null;
  }
};

export { uploadImageToCloudinary };
