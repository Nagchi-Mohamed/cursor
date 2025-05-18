import React from 'react';
import { TextField, Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * FillInTheBlankQuestion component for handling fill-in-the-blank questions
 * @param {Object} props Component props
 * @param {Object} props.question The question object
 * @param {string} props.value The user's answer
 * @param {Function} props.onChange Function to call when answer changes
 * @returns {JSX.Element} The FillInTheBlankQuestion component
 */
const FillInTheBlankQuestion = ({ question, value, onChange }) => {
  const { t } = useLanguage();

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('practice.enterAnswer')}
        variant="outlined"
        inputProps={{
          'aria-label': t('practice.enterAnswer'),
        }}
      />
    </Box>
  );
};

export default FillInTheBlankQuestion; 