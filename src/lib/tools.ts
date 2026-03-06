import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

export interface ShellResult {
  stdout: string;
  stderr: string;
  success: boolean;
  error?: string;
}

interface ExecError extends Error {
  stdout?: string;
  stderr?: string;
}

export const tools = {
  async listFiles({ dir = '.' }: { dir?: string } = {}): Promise<FileItem[] | string> {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      return files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(dir, file.name)
      }));
    } catch (error: unknown) {
      return `Error listing files: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  async readFile({ filepath }: { filepath: string }): Promise<string> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return content;
    } catch (error: unknown) {
      return `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  async writeFile({ filepath, content }: { filepath: string; content: string }): Promise<string> {
    try {
      const dir = path.dirname(filepath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filepath, content, 'utf-8');
      return `Successfully written to ${filepath}`;
    } catch (error: unknown) {
      return `Error writing file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  async deleteFile({ filepath }: { filepath: string }): Promise<string> {
    try {
      await fs.unlink(filepath);
      return `Successfully deleted ${filepath}`;
    } catch (error: unknown) {
      return `Error deleting file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  async runShellCommand({ command }: { command: string }): Promise<ShellResult> {
    try {
      const { stdout, stderr } = await execPromise(command);
      return {
        stdout,
        stderr,
        success: true
      };
    } catch (error: unknown) {
      const execError = error as ExecError;
      return {
        stdout: execError.stdout || "",
        stderr: execError.stderr || "",
        success: false,
        error: execError.message
      };
    }
  }
};

export type ToolName = keyof typeof tools;

export const toolDefinitions = [
  {
    name: "listFiles",
    description: "Lists files and directories in the specified path.",
    parameters: {
      type: "object",
      properties: {
        dir: { type: "string", description: "The directory path (default: .)" }
      }
    }
  },
  {
    name: "readFile",
    description: "Reads the content of a file.",
    parameters: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "The path of the file to read." }
      },
      required: ["filepath"]
    }
  },
  {
    name: "writeFile",
    description: "Writes content to a file. Creates directories if they don't exist.",
    parameters: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "The path of the file to write." },
        content: { type: "string", description: "The content to write." }
      },
      required: ["filepath", "content"]
    }
  },
  {
    name: "deleteFile",
    description: "Deletes a file.",
    parameters: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "The path of the file to delete." }
      },
      required: ["filepath"]
    }
  },
  {
    name: "runShellCommand",
    description: "Runs a shell command and returns stdout and stderr.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "The shell command to run." }
      },
      required: ["command"]
    }
  }
];
