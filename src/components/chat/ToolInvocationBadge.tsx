"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getFilename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>,
  isDone: boolean
): string {
  const path = args.path as string | undefined;
  const filename = path ? getFilename(path) : "file";

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    switch (command) {
      case "create":
        return isDone ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return isDone ? `Edited ${filename}` : `Editing ${filename}`;
      case "view":
        return isDone ? `Read ${filename}` : `Reading ${filename}`;
      default:
        return isDone ? `Updated ${filename}` : `Updating ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    switch (command) {
      case "rename": {
        const newPath = args.new_path as string | undefined;
        const newFilename = newPath ? getFilename(newPath) : "file";
        return isDone
          ? `Renamed ${filename} to ${newFilename}`
          : `Renaming ${filename}`;
      }
      case "delete":
        return isDone ? `Deleted ${filename}` : `Deleting ${filename}`;
      default:
        return isDone ? `Updated ${filename}` : `Updating ${filename}`;
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const isDone = toolInvocation.state === "result";
  const label = getToolLabel(
    toolInvocation.toolName,
    toolInvocation.args as Record<string, unknown>,
    isDone
  );

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
