import { render } from "@testing-library/react";
import { WebSocketProvider } from "./WebSocketContext";

describe("WebSocketProvider", () => {
  test("renders children without throwing an error", () => {
    render(
      <WebSocketProvider>
        <div>Test Child</div>
      </WebSocketProvider>
    );
    // Add your assertions here
  });

  test("creates a WebSocket connection on mount", () => {
    // Mock the socket.io library
    const mockIo = jest.fn();
    const mockSocket = {
      on: jest.fn(),
      close: jest.fn(),
    };
    const apiUrl = "http://example.com"; // Declare and assign the 'apiUrl' variable

    mockIo.mockReturnValue(mockSocket);
    jest.mock("socket.io-client", () => mockIo);

    render(
      <WebSocketProvider>
        <div>Test Child</div>
      </WebSocketProvider>
    );

    // Add your assertions here
    expect(mockIo).toHaveBeenCalledWith(apiUrl);
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  });

  test("closes the WebSocket connection on unmount", () => {
    const mockClose = jest.fn();
    const mockSocket = {
      on: jest.fn(),
      close: mockClose,
    };
    const mockIo = jest.fn().mockReturnValue(mockSocket);
    jest.mock("socket.io-client", () => mockIo);

    const { unmount } = render(
      <WebSocketProvider>
        <div>Test Child</div>
      </WebSocketProvider>
    );

    unmount();

    // Add your assertions here
    expect(mockClose).toHaveBeenCalled();
  });
});
