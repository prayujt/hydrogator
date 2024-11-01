// __mocks__/mapbox-gl.js
module.exports = {
    Map: function () {
      this.flyTo = jest.fn();
      this.easeTo = jest.fn();
      this.on = jest.fn();
      this.remove = jest.fn();
      this.getSource = jest.fn();
      this.addSource = jest.fn();
      this.addLayer = jest.fn();
      this.resize = jest.fn();
      this.addControl = jest.fn();
    },
    Marker: jest.fn().mockImplementation(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      getElement: jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
      }),
    })),
    NavigationControl: jest.fn(),
    GeolocateControl: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
    })),
    Popup: jest.fn().mockImplementation(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      setHTML: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    })),
  };
  