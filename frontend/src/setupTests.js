import "@testing-library/jest-dom";

jest.mock("react-leaflet", () => {
    const React = require("react");

    const MockComponent = ({ children }) =>
        React.createElement("div", null, children);

    return {
        __esModule: true,

        MapContainer: MockComponent,
        TileLayer: MockComponent,
        CircleMarker: MockComponent,
        Popup: MockComponent,
        Marker: MockComponent,
        Tooltip: MockComponent,
        Polygon: MockComponent,
        Polyline: MockComponent,
        Rectangle: MockComponent,

        useMap: jest.fn(() => ({
            setView: jest.fn(),
            flyTo: jest.fn(),
        })),

        useMapEvents: jest.fn(() => ({})),
        useMapEvent: jest.fn(() => ({})),
    };
});
