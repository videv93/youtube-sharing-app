import { render, screen, fireEvent } from "@testing-library/react";
import { RootLayout } from "./RootLayout";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("socket.io-client", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(jest.fn());
    (io as jest.Mock).mockReturnValue({
      on: jest.fn(),
      close: jest.fn(),
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
    const socketMock = (io as jest.Mock).mock.results[0].value;
    const snackbarMessage = `New post added: ${mockPost.title} from ${mockPost.user.username}. Check it out!`;

    fireEvent(socketMock, new Event("new-post"));

    expect(screen.getByText(snackbarMessage)).toBeInTheDocument();
  });
});
