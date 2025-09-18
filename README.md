# Pattern Generator

A React web application built with Vite and Tailwind CSS.

## Prerequisites

Before running this project, you need to install Node.js and npm:

### Install Node.js (Choose one method):

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew first (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (this includes npm)
brew install node
```

**Option B: Direct download**
Visit https://nodejs.org/ and download the LTS version for macOS.

**Option C: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.zshrc

# Install Node.js
nvm install --lts
nvm use --lts
```

### Verify Installation
```bash
node --version
npm --version
```

## Setup Instructions

Once Node.js and npm are installed, follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to see your application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
pattern_generator/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind directives
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── .eslintrc.cjs        # ESLint configuration
```

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## What's Included

- ✅ React 18 with modern hooks
- ✅ Vite for fast development and building
- ✅ Tailwind CSS for styling
- ✅ Hot Module Replacement (HMR)
- ✅ ESLint for code quality
- ✅ Responsive design example
- ✅ Modern development setup

Start editing `src/App.jsx` to customize your application!
