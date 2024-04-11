import { getPosts, createPost, upVotePost, downVotePost } from "./posts";
import { fakeAuthProvider } from "./auth";
import { vi } from "vitest";

describe("getPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch posts successfully", async () => {
    const mockPosts = [
      { id: 1, title: "Post 1" },
      { id: 2, title: "Post 2" },
    ];
    const mockAccessToken = "testAccessToken";

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockPosts),
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    const result = await getPosts();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/posts"),
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(result).toEqual(mockPosts);
  });

  it("should throw an error when fetching posts fails", async () => {
    const mockAccessToken = "testAccessToken";

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    await expect(getPosts()).rejects.toThrowError("Failed to fetch posts");
  });
});

describe("createPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a post successfully", async () => {
    const mockUrl = "https://example.com";
    const mockAccessToken = "testAccessToken";
    const mockResponse = { id: 1, url: mockUrl };

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    const result = await createPost(mockUrl);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/posts"),
      {
        method: "post",
        body: JSON.stringify({ url: mockUrl }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error when creating a post fails", async () => {
    const mockUrl = "https://example.com";
    const mockAccessToken = "testAccessToken";

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    await expect(createPost(mockUrl)).rejects.toThrowError(
      "Failed to create post"
    );
  });
});

describe("upVotePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upvote a post successfully", async () => {
    const mockId = "1";
    const mockAccessToken = "testAccessToken";
    const mockResponse = { id: mockId, upvotes: 1 };

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    const result = await upVotePost(mockId);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/posts/${mockId}/upvote`),
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error when upvoting a post fails", async () => {
    const mockId = "1";
    const mockAccessToken = "testAccessToken";

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    await expect(upVotePost(mockId)).rejects.toThrowError(
      "Failed to upvote post"
    );
  });
});
describe("downVotePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should downvote a post successfully", async () => {
    const mockId = "1";
    const mockAccessToken = "testAccessToken";
    const mockResponse = { id: mockId, downvotes: 1 };

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    const result = await downVotePost(mockId);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/posts/${mockId}/downvote`),
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error when downvoting a post fails", async () => {
    const mockId = "1";
    const mockAccessToken = "testAccessToken";

    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    // Set the fakeAuthProvider accessToken
    fakeAuthProvider.accessToken = mockAccessToken;

    await expect(downVotePost(mockId)).rejects.toThrowError(
      "Failed to downvote post"
    );
  });
});
