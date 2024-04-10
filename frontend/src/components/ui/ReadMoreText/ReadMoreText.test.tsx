import { render, screen, fireEvent } from "@testing-library/react";
import { ReadMoreText } from "./ReadMoreText";

describe("ReadMoreText", () => {
  test("renders the preview text initially", () => {
    render(<ReadMoreText text="Lorem ipsum dolor sit amet" />);
    expect(
      screen.getByText("Lorem ipsum dolor sit amet...")
    ).toBeInTheDocument();
  });

  test('expands and shows the full text when "Read More" button is clicked', () => {
    render(<ReadMoreText text="Lorem ipsum dolor sit amet" />);
    fireEvent.click(screen.getByText("Read More"));
    expect(screen.getByText("Lorem ipsum dolor sit amet")).toBeInTheDocument();
  });

  test('collapses and shows the preview text when "Show Less" button is clicked', () => {
    render(<ReadMoreText text="Lorem ipsum dolor sit amet" />);
    fireEvent.click(screen.getByText("Read More"));
    fireEvent.click(screen.getByText("Show Less"));
    expect(
      screen.getByText("Lorem ipsum dolor sit amet...")
    ).toBeInTheDocument();
  });
});
