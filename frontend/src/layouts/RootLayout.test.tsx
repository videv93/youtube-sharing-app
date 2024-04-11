import { render, screen, fireEvent } from "@testing-library/react";
import { RootLayout } from "./RootLayout";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("socket.io-client", () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
    vi.mocked(io).mockReturnValue({
      on: vi.fn(),
      close: vi.fn(),
    });
  });

  test("renders the navigation and AuthStatus component", () => {
    render(<RootLayout />);
    expect(
      screen.getByRole("button", { name: "Funny Movies" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share a movie" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  test("navigates to the home page when the logo button is clicked", () => {
    render(<RootLayout />);
    const logoButton = screen.getByRole("button", { name: "Funny Movies" });

    fireEvent.click(logoButton);

    expect(useNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("displays a snackbar when a new post is received", () => {
    render(<RootLayout />);
    const mockPost = { title: "Test Post", user: { username: "JohnDoe" } };
    const socketMock = vi.mocked(io).results[0].value;
    const snackbarMessage = `New post added: ${mockPost.title} from ${mockPost.user.username}. Check it out!`;

    fireEvent(socketMock, new Event("new-post"));

    expect(screen.getByText(snackbarMessage)).toBeInTheDocument();
  });
});
