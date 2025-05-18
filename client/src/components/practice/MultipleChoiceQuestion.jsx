import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
} from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * MultipleChoiceQuestion component for handling multiple choice questions
 * @param {Object} props Component props
 * @param {Object} props.question The question object
 * @param {string} props.value The selected answer
 * @param {Function} props.onChange Function to call when answer changes
 * @returns {JSX.Element} The MultipleChoiceQuestion component
 */
const MultipleChoiceQuestion = ({ question, value, onChange }) => {
  const { t } = useLanguage();

  return (
    <FormControl component="fieldset" fullWidth>
      <RadioGroup
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('practice.selectAnswer')}
      >
        {question.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option.value}
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  component="span"
                  dangerouslySetInnerHTML={{ __html: option.text }}
                />
              </Box>
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default MultipleChoiceQuestion; 