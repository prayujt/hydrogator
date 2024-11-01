import React, { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../app/(tabs)/sign-in';
import { API_HOST } from '../constants/vars';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-native-svg', () => {
  return {
    Svg: 'Svg',
    Circle: 'Circle',
    Path: 'Path',
    Rect: 'Rect',
    G: 'G',
    Text: 'Text',
    Line: 'Line',
    Polygon: 'Polygon',
    Polyline: 'Polyline',
    Ellipse: 'Ellipse',
    // Add more components if your tests use them
  };
});

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('../constants/vars', () => ({
  API_HOST: 'http://localhost:3000',
}));

beforeEach(() => {
  // Reset fetch and AsyncStorage mocks before each test to ensure no leftover state
  jest.clearAllMocks();
});

describe('SignInScreen', () => {
  it('should sign in successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ token: 'abc123' }),
      } as Response)
    );
  
    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
  
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByTestId('signInButton');
  
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/signIn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    });
  });
  

  it('should display an error message for invalid email', async () => {
    global.fetch = jest.fn();
    
    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const signInButton = getByTestId('signInButton');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});