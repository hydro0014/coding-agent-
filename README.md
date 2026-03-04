# GeminiAgent 🚀

A powerful, UI-based AI coding agent inspired by Claude Code. Built with Next.js and powered by Google Gemini 2.0 Flash.

## Features
- **Agentic Workflow:** Automatically breaks down complex prompts into manageable tasks.
- **Tool Access:** Can read/write files and execute shell commands.
- **Real-time UI:** See the agent's thoughts, tool calls, and workspace changes live.
- **Task Tracking:** Visual progress bar for the agent's current plan.

## Setup

### Prerequisites
- Node.js 18+
- Google Gemini API Key

### Installation

1. Clone the repository (if applicable) or enter the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variable:
   ```bash
   export GOOGLE_API_KEY=your_gemini_api_key_here
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using the agent.

## Usage
Ask the agent to perform coding tasks like:
- "Initialize a new React component for a weather widget."
- "Create a python script to scrape news headlines and save them to headlines.txt."
- "Fix the bug in my math utility and run the tests."

## Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more details.
