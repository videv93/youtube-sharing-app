import { render, screen, fireEvent } from "@testing-library/react";
import { AuthStatus } from "./AuthStatus";
import { useRouteLoaderData, useFetcher, useNavigate } from "react-router-dom";
import { vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useRouteLoaderData: vi.fn(),
  useFetcher: vi.fn(),
  useNavigate: vi.fn(),
}));

describe("AuthStatus", () => {
  beforeEach(() => {
    vi.mocked(useRouteLoaderData).mockReturnValue({ user: "JohnDoe" });
    vi.mocked(useFetcher).mockReturnValue({
      // @ts-expect-error('')
      Form: ({ children }: { children: React.ReactNode }) => (
        <form>{children}</form>
      ),
    });
    // @ts-expect-error('')
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  test("renders the welcome message and buttons", () => {
    render(<AuthStatus />);
    expect(screen.getByText("Welcome JohnDoe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share a movie" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  test("navigates to the new post page when 'Share a movie' button is clicked", () => {
    render(<AuthStatus />);
    const shareButton = screen.getByRole("button", { name: "Share a movie" });

    fireEvent.click(shareButton);

    expect(useNavigate).toHaveBeenCalledWith("/posts/new", { replace: true });
  });

  test("submits the logout form when 'Logout' button is clicked", () => {
    render(<AuthStatus />);
    const logoutButton = screen.getByRole("button", { name: "Logout" });

    fireEvent.click(logoutButton);

    expect(useFetcher).toHaveBeenCalledWith();
    expect(screen.getByText("Logging out...")).toBeInTheDocument();
  });
});
