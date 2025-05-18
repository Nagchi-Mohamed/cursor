import React, { useRef } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import useImageUpload from '../../hooks/useImageUpload';

const ImageUploadButton = ({ onImageUpload }) => {
  const fileInputRef = useRef(null);
  const { uploadImage, uploading, error } = useImageUpload();
  const { t } = useLanguage();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      onImageUpload(imageUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <Tooltip title={t('admin.uploadImage')}>
        <span>
          <IconButton
            onClick={handleClick}
            disabled={uploading}
            size="small"
          >
            {uploading ? (
              <CircularProgress size={20} />
            ) : (
              <ImageIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

export default ImageUploadButton; 