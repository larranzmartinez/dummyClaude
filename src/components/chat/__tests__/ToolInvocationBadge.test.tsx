import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getToolLabel unit tests

test("getToolLabel: str_replace_editor create in progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, false)).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor create done", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" }, true)).toBe("Created App.jsx");
});

test("getToolLabel: str_replace_editor str_replace in progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/Card.jsx" }, false)).toBe("Editing Card.jsx");
});

test("getToolLabel: str_replace_editor str_replace done", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/Card.jsx" }, true)).toBe("Edited Card.jsx");
});

test("getToolLabel: str_replace_editor insert treated same as str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/Button.jsx" }, false)).toBe("Editing Button.jsx");
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/Button.jsx" }, true)).toBe("Edited Button.jsx");
});

test("getToolLabel: str_replace_editor view in progress", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/index.js" }, false)).toBe("Reading index.js");
});

test("getToolLabel: str_replace_editor view done", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/index.js" }, true)).toBe("Read index.js");
});

test("getToolLabel: str_replace_editor extracts filename from nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/src/components/Button.jsx" }, true)).toBe("Created Button.jsx");
});

test("getToolLabel: file_manager delete in progress", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" }, false)).toBe("Deleting App.jsx");
});

test("getToolLabel: file_manager delete done", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" }, true)).toBe("Deleted App.jsx");
});

test("getToolLabel: file_manager rename done", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/App.jsx", new_path: "/NewApp.jsx" }, true)).toBe("Renamed App.jsx to NewApp.jsx");
});

test("getToolLabel: file_manager rename in progress", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/App.jsx" }, false)).toBe("Renaming App.jsx");
});

test("getToolLabel: missing path falls back to 'file'", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" }, false)).toBe("Creating file");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_unknown_tool", {}, false)).toBe("some_unknown_tool");
});

// ToolInvocationBadge component tests

test("ToolInvocationBadge shows human-friendly label for create in progress", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows human-friendly label for create done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "Success",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows spinner when in progress", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows green dot when done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "Success",
  };
  const { container } = render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge shows file_manager delete done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "file_manager",
    args: { command: "delete", path: "/old-component.jsx" },
    state: "result",
    result: { success: true },
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleted old-component.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows file_manager rename done", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "file_manager",
    args: { command: "rename", path: "/App.jsx", new_path: "/NewApp.jsx" },
    state: "result",
    result: { success: true },
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renamed App.jsx to NewApp.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows str_replace editing in progress", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/Card.jsx" },
    state: "call",
  };
  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});
