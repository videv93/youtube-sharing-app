interface AuthProvider {
  isAuthenticated: boolean;
  username: null | string;
  accessToken: null | string;
  signin(username: string, password: string): Promise<void>;
  signout(): Promise<void>;
}

const apiUrl = import.meta.env.VITE_API_URL;

/**
 * This represents some generic auth provider API, like Firebase.
 */
export const fakeAuthProvider: AuthProvider = {
  isAuthenticated: localStorage.getItem("isAuthenticated") === "true" || false,
  username: localStorage.getItem("username") || null,
  accessToken: localStorage.getItem("accessToken") || null,
  async signin(username: string, password: string) {
    const response = await fetch(apiUrl + "/auth/signIn", {
      method: "post",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Signin failed");
    }
    const responseJson = await response.json();
    fakeAuthProvider.isAuthenticated = true;
    fakeAuthProvider.username = username;
    fakeAuthProvider.accessToken = responseJson.access_token;
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("accessToken", responseJson.access_token);
  },
  async signout() {
    fakeAuthProvider.isAuthenticated = false;
    fakeAuthProvider.username = "";
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("username", "");
    localStorage.setItem("accessToken", "");
  },
};
