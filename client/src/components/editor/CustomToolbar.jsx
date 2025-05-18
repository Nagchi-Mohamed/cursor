import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import ImageUploadButton from './ImageUploadButton';

const CustomToolbar = ({ onImageUpload }) => {
  const { t } = useLanguage();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <ImageUploadButton onImageUpload={onImageUpload} />
      {/* Add more custom toolbar buttons here as needed */}
    </Box>
  );
};

export default CustomToolbar; 