import React, { useState } from 'react';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import FormField from '../FormField';

describe('FormField Component', () => {
  const Wrapper = ({ initialValue = '' }) => {
    const [value, setValue] = useState(initialValue);
    const handleChange = (e) => {
      setValue(e.target.value);
    };
    return (
      <FormField
        name="testField"
        label="Test Field"
        value={value}
        onChange={handleChange}
      />
    );
  };

  test('renders with label and input field', () => {
    render(<Wrapper />);
    
    // Check label is present
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    
    // Check input field is present
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('name', 'testField');
  });
  
  test('handles input changes', () => {
    render(<Wrapper />);
    
    // Find input and change its value
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    fireEvent.change(inputElement, { target: { value: 'new value' } });
    
    // Check that input value updated
    expect(inputElement.value).toBe('new value');
  });
  
  test('displays error message when error is provided', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} error="This field is required" />);
    
    // Error message should be displayed
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    // Input should have aria-invalid attribute set to true
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
  });
  
  test('displays helper text when provided', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} helperText="Enter your full name" />);
    
    // Helper text should be displayed
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });
  
  test('prioritizes error message over helper text', () => {
    render(
      <FormField 
        name="testField"
        label="Test Field"
        value=""
        onChange={() => {}}
        error="This field is required"
        helperText="Enter your full name"
      />
    );
    
    // Error message should be displayed
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    // Helper text should not be displayed
    expect(screen.queryByText('Enter your full name')).not.toBeInTheDocument();
  });
  
  test('handles required attribute correctly', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} required={true} />);
    
    // Input should have required attribute
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement).toHaveAttribute('required');
    expect(inputElement).toHaveAttribute('aria-required', 'true');
  });
  
  test('handles different input types', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} type="password" />);
    
    // Input should have type="password"
    const inputElement = screen.getByLabelText('Test Field');
    expect(inputElement).toHaveAttribute('type', 'password');
  });
  
  test('applies custom input props', () => {
    render(
      <FormField 
        name="testField"
        label="Test Field"
        value=""
        onChange={() => {}}
        inputProps={{ 
          'data-testid': 'custom-test-id',
          'maxLength': 50
        }}
      />
    );
    
    // Input should have custom attribute
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement).toHaveAttribute('data-testid', 'custom-test-id');
    expect(inputElement).toHaveAttribute('maxLength', '50');
  });
  
  test('generates id if not provided', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} />);
    
    // Input should have an auto-generated ID based on name
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement.id).toBe('field-testField');
  });
  
  test('uses provided id when available', () => {
    render(<FormField name="testField" label="Test Field" value="" onChange={() => {}} id="custom-id" />);
    
    // Input should have the provided custom ID
    const inputElement = screen.getByRole('textbox', { name: 'Test Field' });
    expect(inputElement.id).toBe('custom-id');
  });
});
