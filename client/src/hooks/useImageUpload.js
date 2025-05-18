import { useState } from 'react';
import adminLessonService from '../services/adminLessonService';

const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('media', file);

      const response = await adminLessonService.uploadLessonMedia(formData);
      return response.data.url;
    } catch (err) {
      setError(err.message || 'Failed to upload image');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
    error
  };
};

export default useImageUpload; 