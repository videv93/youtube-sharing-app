import { fakeAuthProvider } from "./auth";

describe("fakeAuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with default values", () => {
    expect(fakeAuthProvider.isAuthenticated).toBe(false);
    expect(fakeAuthProvider.username).toBeNull();
    expect(fakeAuthProvider.accessToken).toBeNull();
  });

  describe("signin", () => {
    it("should set isAuthenticated, username, and accessToken when signin is successful", async () => {
      const username = "testuser";
      const password = "testpassword";
      const accessToken = "testaccesstoken";

      // Mock the fetch function
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ access_token: accessToken }),
      });

      await fakeAuthProvider.signin(username, password);

      expect(fakeAuthProvider.isAuthenticated).toBe(true);
      expect(fakeAuthProvider.username).toBe(username);
      expect(fakeAuthProvider.accessToken).toBe(accessToken);
      expect(localStorage.getItem("isAuthenticated")).toBe("true");
      expect(localStorage.getItem("username")).toBe(username);
      expect(localStorage.getItem("accessToken")).toBe(accessToken);
    });

    it("should throw an error when signin fails", async () => {
      const username = "testuser";
      const password = "testpassword";

      // Mock the fetch function
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        fakeAuthProvider.signin(username, password)
      ).rejects.toThrowError("Signin failed");
    });
  });

  describe("signout", () => {
    it("should reset isAuthenticated, username, and accessToken", () => {
      fakeAuthProvider.isAuthenticated = true;
      fakeAuthProvider.username = "testuser";
      fakeAuthProvider.accessToken = "testaccesstoken";

      fakeAuthProvider.signout();

      expect(fakeAuthProvider.isAuthenticated).toBe(false);
      expect(fakeAuthProvider.username).toBe("");
      expect(localStorage.getItem("isAuthenticated")).toBe("false");
      expect(localStorage.getItem("username")).toBe("");
      expect(localStorage.getItem("accessToken")).toBe("");
    });
  });
});
