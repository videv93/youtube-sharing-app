import { render, screen, fireEvent } from "@testing-library/react";
import { PostList } from "./PostList";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { upVotePost, downVotePost } from "../api/posts";
import { vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useLoaderData: vi.fn(),
  useRevalidator: vi.fn(),
}));

vi.mock("../api/posts", () => ({
  upVotePost: vi.fn(),
  downVotePost: vi.fn(),
}));

describe("PostList", () => {
  beforeEach(() => {
    vi.mocked(useLoaderData).mockReturnValue({
      posts: [
        {
          _id: "1",
          videoId: "video1",
          title: "Post 1",
          user: { username: "JohnDoe" },
          upvotes: 5,
          downvotes: 2,
          voted: false,
          description: "Post 1 description",
        },
        {
          _id: "2",
          videoId: "video2",
          title: "Post 2",
          user: { username: "JaneSmith" },
          upvotes: 3,
          downvotes: 1,
          voted: true,
          description: "Post 2 description",
        },
      ],
    });
    // @ts-expect-error('')
    vi.mocked(useRevalidator).mockReturnValue({ revalidate: vi.fn() });
  });

  test("renders the list of posts", () => {
    render(<PostList />);
    const postElements = screen.getAllByRole("listitem");

    expect(postElements).toHaveLength(2);
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
  });

  test("renders the post details correctly", () => {
    render(<PostList />);
    const postElement = screen.getByText("Post 1");

    expect(postElement).toBeInTheDocument();
    expect(screen.getByText("Shared by: JohnDoe")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Description:")).toBeInTheDocument();
    expect(screen.getByText("Post 1 description")).toBeInTheDocument();
  });

  test("disables upvote button if user is not authenticated or has already voted", () => {
    render(<PostList />);
    const upvoteButton = screen.getByRole("button", { name: "Upvote" });

    expect(upvoteButton).toBeDisabled();
  });

  test("disables downvote button if user is not authenticated or has already voted", () => {
    render(<PostList />);
    const downvoteButton = screen.getByRole("button", { name: "Downvote" });

    expect(downvoteButton).toBeDisabled();
  });

  test("calls upVotePost and revalidates when upvote button is clicked", async () => {
    render(<PostList />);
    const upvoteButton = screen.getByRole("button", { name: "Upvote" });

    fireEvent.click(upvoteButton);

    expect(upVotePost).toHaveBeenCalledWith("1");
    expect(useRevalidator().revalidate).toHaveBeenCalled();
  });

  test("calls downVotePost and revalidates when downvote button is clicked", async () => {
    render(<PostList />);
    const downvoteButton = screen.getByRole("button", { name: "Downvote" });

    fireEvent.click(downvoteButton);

    expect(downVotePost).toHaveBeenCalledWith("1");
    expect(useRevalidator().revalidate).toHaveBeenCalled();
  });
});
