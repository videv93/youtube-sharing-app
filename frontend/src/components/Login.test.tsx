import { render, screen, fireEvent } from "@testing-library/react";
import { Login } from "./Login";
import { useLocation, useNavigation, useActionData } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  useNavigation: jest.fn(),
  useActionData: jest.fn(),
}));

describe("Login", () => {
  beforeEach(() => {
    (useLocation as jest.Mock).mockReturnValue({
      search: "?from=/",
    });
    (useNavigation as jest.Mock).mockReturnValue({
      formData: new FormData(),
    });
    (useActionData as jest.Mock).mockReturnValue(undefined);
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
    (useNavigation as jest.Mock).mockReturnValue({
      formData: new FormData([["username", "john"]]),
    });
    render(<Login />);
    expect(
      screen.getByRole("button", { name: "Logging in..." })
    ).toBeDisabled();
  });

  test("displays an error message if actionData has an error", () => {
    (useActionData as jest.Mock).mockReturnValue({
      error: "Invalid credentials",
    });
    render(<Login />);
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("submits the form with the correct values", () => {
    const mockFormData = new FormData();
    (useNavigation as jest.Mock).mockReturnValue({
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
