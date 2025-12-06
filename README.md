# FileBert

A modern Electron-based desktop application for seamless file sharing and collaboration with hand gesture recognition capabilities.

## Features

- **Room-Based File Sharing**: Create or join rooms to share files with others
- **Hand Gesture Recognition**: Control the application using hand gestures powered by TensorFlow.js and ML5
- **Overlay Notifications**: Non-intrusive overlay window for real-time notifications
- **Member Management**: View and manage room members with role-based permissions
- **Question & Answer System**: Interactive Q&A functionality for collaborative sessions
- **File History**: Track and search through shared file history
- **Settings Management**: Customize application preferences and configure gesture controls

## Tech Stack

- **Framework**: Electron 39.0.0
- **Frontend**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS 4.1.16
- **Machine Learning**: TensorFlow.js, ML5, HandPose model
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **UI Components**: Radix UI, Lucide React icons
- **Build Tools**: Vite, Electron Forge

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd FileBert
```

2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun start
```

## Available Scripts

- `bun start` - Start the Electron application in development mode
- `bun run package` - Package the application for distribution
- `bun run make` - Create distributable packages for your platform
- `bun run publish` - Publish the application
- `bun run lint` - Run ESLint to check code quality

## Project Structure

```
FileBert/
├── src/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script for IPC
│   ├── renderer.tsx         # React application entry point
│   ├── routes/              # Application routes
│   │   ├── start.tsx        # Start screen (create/join room)
│   │   ├── main-overlay.tsx # Main overlay window
│   │   ├── members.tsx      # Members management
│   │   ├── settings.tsx     # Settings page
│   │   ├── history.tsx      # File history
│   │   ├── question.tsx     # Question window
│   │   └── gesture-worker.tsx # Gesture recognition worker
│   ├── lib/
│   │   ├── gesture/         # Gesture recognition utilities
│   │   └── utils.ts         # Utility functions
│   └── components/          # React components
│       ├── global/          # Global components
│       └── ui/              # UI component library
├── public/                  # Static assets
├── package.json
└── README.md
```

## Gesture Controls

FileBert supports hand gesture recognition for hands-free interaction:

- **Open/Close Gesture**: Open or close rooms
- **Send/Receive Gesture**: Send or receive files

Gesture recognition is powered by TensorFlow.js HandPose model and runs in a dedicated worker window for optimal performance.

## Window Modes

- **Start Screen**: Normal window for creating or joining rooms
- **Overlay Mode**: Frameless, always-on-top overlay window for notifications
- **Secondary Windows**: Separate windows for members, settings, history, and questions

## Building for Production

To build the application for production:

```bash
bun make
```

This will create platform-specific distributable packages in the `out/` directory.

## License

MIT License
