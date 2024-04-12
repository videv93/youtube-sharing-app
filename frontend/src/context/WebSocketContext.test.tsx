import { render } from "@testing-library/react";
import { WebSocketProvider } from "./WebSocketContext";
import { vi } from "vitest";

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
    const apiUrl = "http://example.com"; // Declare and assign the 'apiUrl' variable

    const mockSocket = {
      on: vi.fn(),
      close: vi.fn(),
    };
    const mockIo = vi.fn().mockReturnValue(mockSocket);
    vi.mock("socket.io-client", () => mockIo);

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
    const mockClose = vi.fn();
    const mockSocket = {
      on: vi.fn(),
      close: mockClose,
    };
    const mockIo = vi.fn().mockReturnValue(mockSocket);
    vi.mock("socket.io-client", () => mockIo);

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
