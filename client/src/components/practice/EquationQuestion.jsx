import React, { useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import 'katex/dist/katex.min.css';
import katex from 'katex';

/**
 * EquationQuestion component for handling mathematical equation input
 * @param {Object} props Component props
 * @param {Object} props.question The question object
 * @param {string} props.value The user's answer
 * @param {Function} props.onChange Function to call when answer changes
 * @returns {JSX.Element} The EquationQuestion component
 */
const EquationQuestion = ({ question, value, onChange }) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const handleChange = (newValue) => {
    onChange(newValue);
    try {
      const rendered = katex.renderToString(newValue, {
        throwOnError: false,
        displayMode: false,
      });
      setPreview(rendered);
      setError('');
    } catch (err) {
      setError(t('practice.invalidEquation'));
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t('practice.enterEquation')}
        variant="outlined"
        error={!!error}
        helperText={error}
        inputProps={{
          'aria-label': t('practice.enterEquation'),
        }}
      />
      {preview && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            component="div"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </Box>
      )}
    </Box>
  );
};

export default EquationQuestion; 