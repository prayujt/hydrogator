import React, { ReactNode } from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ForgotPasswordScreen from '../app/(tabs)/forgot-password'; // Adjust import path as needed
import { API_HOST } from '../constants/vars';

// Mock dependencies
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: Email Submission', () => {
    it('should show error for empty email', async () => {
      const { getByText } = render(<ForgotPasswordScreen />);
      
      const submitButton = getByText('Submit');
      
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
          'Error', 
          'Please enter your email address.'
        );
      });
    });

    it('should show error for invalid email format', async () => {
      const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
      
      const emailInput = getByPlaceholderText('Enter your email');
      const submitButton = getByText('Submit');
      
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
          'Error', 
          'Please enter a valid email address.'
        );
      });
    });

    it('should proceed to step 2 with valid email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Reset code sent' }),
      });

      const { getByPlaceholderText, getByText, queryByText } = render(<ForgotPasswordScreen />);
      
      const emailInput = getByPlaceholderText('Enter your email');
      const submitButton = getByText('Submit');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`${API_HOST}/generateForgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
        
        expect(getByText('Enter the 6-digit code sent to your email')).toBeTruthy();
      });
    });
  });

  describe('Step 2: Reset Code Validation', () => {
    it('should show error for empty reset code', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Reset code sent' }),
        });

      const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
      
      // Simulate reaching step 2
      const emailInput = getByPlaceholderText('Enter your email');
      const submitButton = getByText('Submit');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Enter the 6-digit code sent to your email')).toBeTruthy();
      });

      const codeSubmitButton = getByText('Submit Code');
      fireEvent.press(codeSubmitButton);
  
      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
          'Error', 
          'Please enter the 6-digit reset code.'
        );
      });
    });
  
    it('should proceed to step 3 with valid reset code', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Reset code sent' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'abc123' }),
        });
  
      const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);
      
      // Simulate reaching step 2
      const emailInput = getByPlaceholderText('Enter your email');
      const submitButton = getByText('Submit');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);
  
      await waitFor(() => {
        expect(getByText('Enter the 6-digit code sent to your email')).toBeTruthy();
      });

      // Submit reset code
      const codeInput = getByPlaceholderText('Enter reset code');
      const codeSubmitButton = getByText('Submit Code');
      
      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(codeSubmitButton);
  
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`${API_HOST}/validateForgot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'test@example.com', 
            code: '123456' 
          }),
        });
        
        expect(getByText('New Password')).toBeTruthy();
      });
    });
  });

  describe('Step 3: Password Reset', () => {
    it('should show error for mismatched passwords', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Reset code sent' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: 'abc123' }),
        });

      const { getByPlaceholderText, getByText, getByTestId } = render(<ForgotPasswordScreen />);
      
      // Simulate reaching step 3
      const emailInput = getByPlaceholderText('Enter your email');
      const submitButton = getByText('Submit');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Enter the 6-digit code sent to your email')).toBeTruthy();
      });

      const codeInput = getByPlaceholderText('Enter reset code');
      const codeSubmitButton = getByText('Submit Code');
      
      fireEvent.changeText(codeInput, '123456');
      fireEvent.press(codeSubmitButton);

      await waitFor(() => {
        expect(getByText('New Password')).toBeTruthy();
      });

      // Try to reset password with mismatched passwords
      const newPasswordInput = getByPlaceholderText('Enter new password');
      const confirmPasswordInput = getByPlaceholderText('Confirm new password');
      const resetButton = getByTestId('resetPasswordButton');
      
      fireEvent.changeText(newPasswordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
          'Error', 
          'Passwords do not match.'
        );
      });
    });
  });
});