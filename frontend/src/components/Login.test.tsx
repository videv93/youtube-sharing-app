import { render, screen, fireEvent } from "@testing-library/react";
import { Login } from "./Login";
import { useLocation, useNavigation, useActionData } from "react-router-dom";
import { vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
  useNavigation: vi.fn(),
  useActionData: vi.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    // @ts-expect-error('')
    vi.mocked(useLocation).mockReturnValue({
      search: "?from=/",
    });
    // @ts-expect-error('')
    vi.mocked(useNavigation).mockReturnValue({
      formData: new FormData(),
    });
    vi.mocked(useActionData).mockReturnValue(undefined);
  });

  test("renders the login form", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Login/Register" })
    ).toBeInTheDocument();
  });

  test("disables the submit button when logging in", () => {
    const formData = new FormData();
    formData.append("username", "john");
    // @ts-expect-error('')
    vi.mocked(useNavigation).mockReturnValue({
      formData: formData,
    });
    render(<Login />);
    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();
  });

  test("displays an error message if actionData has an error", () => {
    vi.mocked(useActionData).mockReturnValue({
      error: "Invalid credentials",
    });
    render(<Login />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("submits the form with the correct values", () => {
    const mockFormData = new FormData();
    // @ts-expect-error('')
    vi.mocked(useNavigation).mockReturnValue({
      formData: mockFormData,
    });
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: "Login/Register" });

    fireEvent.change(usernameInput, { target: { value: "john" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    expect(mockFormData.get("username")).toBe("john");
    expect(mockFormData.get("password")).toBe("password");
  });
});
