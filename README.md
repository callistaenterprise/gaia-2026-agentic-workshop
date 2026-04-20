# Building agentic applications workshop

Welcome to the **Building agentic applications** workshop! 

---

## Preparations prior to the workshop


**Bring your own computer to participate in the session.** To ensure everything runs smoothly and to save time during the event, please complete the following steps in advance. 

### 1. Install Node.js (Version 22 LTS)
Node.js is required for running JavaScript-based tools and applications. We require *Node.js version 22 (LTS)*. The exercises have been tested and verified with version `v22.18.0`. Older versions might not be compatible.

We recommend using a version manager like `nvm` to install and manage Node.js, as it provides more flexibility.

#### Recommended: Using a Node Version Manager (nvm)
`nvm` allows you to easily switch between different Node.js versions.

##### macOS & Linux
1. Open your terminal and install nvm using the official install script:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   ```
2. Close and reopen your terminal for the changes to take effect.
3. Install and use Node.js LTS version 22:
   ```bash
   nvm install 22
   nvm use 22
   ```
4. Verify the installation:
   ```bash
   node --version
   # Should output v22.x.x
   npm --version
   ```

##### Windows
1. Download and run the installer for [nvm-windows](https://github.com/coreybutler/nvm-windows/releases).
2. Once installed, open a new terminal (Command Prompt or PowerShell) and run:
   ```bash
   nvm install 22
   nvm use 22
   ```
3. Verify the installation:
   ```bash
   node --version
   # Should output v22.x.x
   npm --version
   ```

#### Alternative: Direct Installation
If you prefer not to use a version manager such as `nvm`, you can install Node.js directly.

##### Windows
1. Download the Windows installer from the [Node.js official website](https://nodejs.org/).
2. Run the installer and follow the prompts.
3. Open a terminal (Command Prompt or PowerShell) and verify the installation:
   ```bash
   node --version
   npm --version
   ```

##### macOS
1. Install Node.js using Homebrew:
   ```bash
   brew install node
   ```
2. Verify the installation:
   ```bash
   node --version
   npm --version
   ```

##### Linux
1. Install Node.js via your package manager (e.g., apt for Ubuntu):
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```
2. Verify the installation:
   ```bash
   node --version
   npm --version
   ```

Alternatively, you can download the Node.js installer from the [Node.js official website](https://nodejs.org/) for your platform.

### 2. Install Git
Git is required for version control and cloning the workshop repository. If you already have Git installed, you can skip this step.

#### Windows
1. Download the Git installer from the [Git official website](https://git-scm.com/).
2. Run the installer and follow the prompts.
3. Open a terminal and verify the installation:
   ```bash
   git --version
   ```

#### macOS
1. Install Git using Homebrew:
   ```bash
   brew install git
   ```
2. Verify the installation:
   ```bash
   git --version
   ```

#### Linux
1. Install Git via your package manager:
   ```bash
   sudo apt update
   sudo apt install git
   ```
2. Verify the installation:
   ```bash
   git --version
   ```

### 3. Install an IDE
You will need an Integrated Development Environment (IDE) for coding. If you already have a favorite IDE installed, you can skip this step. We recommend [Visual Studio Code](https://code.visualstudio.com/).

#### Windows/Mac/Linux
1. Download the installer for your platform from the [VS Code official website](https://code.visualstudio.com/).
2. Follow the installation prompts.

Alternatively, you may use another IDE of your choice.

### 4. Clone the workshop repository
Once you have installed Git:

1. Open a terminal and run the following command to clone this repository:
   ```bash
   git clone https://github.com/callistaenterprise/gaia-2026-agentic-workshop.git
   ```
2. Navigate into the repository folder:
   ```bash
   cd gaia-2026-agentic-workshop
   ```

---

That’s it! You’re now prepared to dive into the workshop. See you there!

# Workshop

[&#x25B6; Click here to proceed to Exercise 1](./instructions/exercise-1/exercise-1.md)