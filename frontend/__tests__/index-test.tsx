import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MapScreen from '../app/(tabs)/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the BottomSheetModalProvider
jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BottomSheet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the router to avoid navigation errors
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
  }));
  
// Mock AsyncStorage to simulate user token
beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mockedToken');
});

describe('MapScreen', () => {
  it('should render the map container', () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId('mapContainer')).toBeTruthy();
  });

  it('should fetch buildings on mount', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', name: 'Building 1', fountainCount: 3, latitude: -82.35, longitude: 29.645 }],
    });
    
    const { getByText } = render(<MapScreen />);

    await waitFor(() => {
      expect(getByText('Building 1')).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_HOST}/buildings`, expect.anything());
  });

  it('should show BottomSheet with fountain details when a marker is clicked', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', floor: 1, description: 'First Floor Fountain' }],
    });

    const { getByText, queryByText } = render(<MapScreen />);

    await act(async () => {
      fireEvent.press(getByText('Building 1'));  // Simulate marker click
    });

    await waitFor(() => {
      expect(queryByText('First Floor Fountain')).toBeTruthy();
    });

    expect(fetch).toHaveBeenCalledWith(`${API_HOST}/buildings/1/fountains`, expect.anything());
  });

  it('should handle missing token error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // Simulate no token
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    render(<MapScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('no token found'));
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    render(<MapScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Network error'));
    });

    consoleErrorSpy.mockRestore();
  });
});
