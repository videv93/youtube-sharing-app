import { fakeAuthProvider } from "./auth";

export async function getPosts() {
  const response = await fetch("http://localhost:3000/posts", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fakeAuthProvider.accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export async function createPost(url: string) {
  const accessToken = fakeAuthProvider.accessToken;
  const response = await fetch("http://localhost:3000/posts", {
    method: "post",
    body: JSON.stringify({ url }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to create post");
  }
  return response.json();
}

export async function upVotePost(id: number) {
  const accessToken = fakeAuthProvider.accessToken;
  const response = await fetch(`http://localhost:3000/posts/${id}/upvote`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to upvote post");
  }
  return response.json();
}

export async function downVotePost(id: number) {
  const accessToken = fakeAuthProvider.accessToken;
  const response = await fetch(`http://localhost:3000/posts/${id}/downvote`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to downvote post");
  }
  return response.json();
}
