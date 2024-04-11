import { afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { mockServer } from "./mockServer";
import "@testing-library/jest-dom/vitest";
import "jest";

beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  mockServer.resetHandlers();
});

afterAll(() => {
  mockServer.close();
});
