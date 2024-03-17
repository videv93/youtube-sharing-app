import { fakeAuthProvider } from "./auth";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(import.meta.env);

export async function getPosts() {
  const response = await fetch(apiUrl + "/posts", {
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
  const response = await fetch(apiUrl + "/posts", {
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

export async function upVotePost(id: string) {
  const accessToken = fakeAuthProvider.accessToken;
  const response = await fetch(`${apiUrl}/posts/${id}/upvote`, {
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

export async function downVotePost(id: string) {
  const accessToken = fakeAuthProvider.accessToken;
  const response = await fetch(`${apiUrl}/posts/${id}/downvote`, {
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
