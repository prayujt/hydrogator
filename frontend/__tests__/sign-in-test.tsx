import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../app/(tabs)/sign-in';
import { API_HOST } from '../constants/vars';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../constants/vars', () => ({
  API_HOST: 'https://example.com/api',
}));

describe('SignInScreen', () => {
  it('should sign in successfully', async () => {
    const mockSignIn = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'abc123' }),
    });

    jest.spyOn(global, 'fetch').mockImplementation(mockSignIn);

    const { getByPlaceholderText, getByText, getByTestId } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(`${API_HOST}/signIn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      expect(global.fetch).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
      expect(getByTestId('main-tabs')).toBeTruthy();
    });
  });

  it('should display an error message for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(getByText('Please enter a valid email address.')).toBeTruthy();
    });
  });
});