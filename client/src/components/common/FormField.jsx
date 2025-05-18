import React from 'react';
import { TextField, FormControl, FormHelperText } from '@mui/material';

/**
 * @module components/common/FormField
 * @description A reusable form field component with built-in accessibility features
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the field
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.type] - Input type (text, email, password, etc.)
 * @param {string} [props.helperText] - Additional helper text
 * @param {Object} [props.inputProps] - Additional props for the input element
 * @param {Object} [props.rest] - Additional props for the TextField
 */
const FormField = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  type = 'text',
  helperText,
  inputProps,
  ...rest
}) => {
  // Generate a unique ID if not provided
  const fieldId = id || `field-${name}`;
  
  // Determine if the field is in an error state
  const hasError = !!error;
  
  // Combine helper text with error message if present
  const displayHelperText = error || helperText;

  return (
    <FormControl
      fullWidth
      error={hasError}
      required={required}
      aria-required={required}
      aria-invalid={hasError}
      aria-describedby={displayHelperText ? `${fieldId}-helper` : undefined}
    >
      <TextField
        id={fieldId}
        name={name}
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        error={hasError}
        inputProps={{
          'aria-label': label,
          'aria-required': required,
          'aria-invalid': hasError,
          ...inputProps,
        }}
        {...rest}
      />
      {displayHelperText && (
        <FormHelperText id={`${fieldId}-helper`}>
          {displayHelperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormField; 