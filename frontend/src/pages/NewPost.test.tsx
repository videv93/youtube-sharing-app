import { render, screen, fireEvent } from "@testing-library/react";
import { NewPost } from "./NewPost";

describe("NewPost", () => {
  test("renders the form with input field and submit button", () => {
    render(<NewPost />);
    expect(screen.getByLabelText("Youtube URL:")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Youtube URL:" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  test("submits the form when the Share button is clicked", () => {
    render(<NewPost />);
    const urlInput = screen.getByRole("textbox", { name: "Youtube URL:" });
    const shareButton = screen.getByRole("button", { name: "Share" });

    fireEvent.change(urlInput, {
      target: { value: "https://www.youtube.com/watch?v=abc123" },
    });
    fireEvent.click(shareButton);

    // Add your assertions for form submission here
  });
});
