import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const tools = {
  async listFiles({ dir = '.' }: { dir?: string } = {}) {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });
      return files.map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        path: path.join(dir, file.name)
      }));
    } catch (error: any) {
      return `Error listing files: ${error.message}`;
    }
  },

  async readFile({ filepath }: { filepath: string }) {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      return content;
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  },

  async writeFile({ filepath, content }: { filepath: string; content: string }) {
    try {
      const dir = path.dirname(filepath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filepath, content, 'utf-8');
      return `Successfully written to ${filepath}`;
    } catch (error: any) {
      return `Error writing file: ${error.message}`;
    }
  },

  async deleteFile({ filepath }: { filepath: string }) {
    try {
      await fs.unlink(filepath);
      return `Successfully deleted ${filepath}`;
    } catch (error: any) {
      return `Error deleting file: ${error.message}`;
    }
  },

  async runShellCommand({ command }: { command: string }) {
    try {
      const { stdout, stderr } = await execPromise(command);
      return {
        stdout,
        stderr,
        success: true
      };
    } catch (error: any) {
      return {
        stdout: error.stdout,
        stderr: error.stderr,
        success: false,
        error: error.message
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
