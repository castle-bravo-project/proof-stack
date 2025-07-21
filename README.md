# ProofStack - Digital Evidence Assessment Platform

![Deployment Status](https://github.com/castle-bravo-project/proof-stack/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Introduction

ProofStack is a comprehensive digital evidence assessment platform that helps legal professionals evaluate the admissibility of digital evidence against established legal standards. The platform combines educational content with AI-powered analysis to provide detailed insights into evidence strength and potential challenges.

## 🚀 Progressive Enhancement API Key Management

ProofStack implements a user-friendly progressive enhancement approach to API key management:

### **Zero Barrier to Entry**
- **Demo Mode**: Explore the full application immediately without any setup
- **Educational Content**: Learn about digital evidence admissibility with comprehensive demo analysis
- **No Registration Required**: Start using the platform instantly

### **AI-Powered Features (Optional)**
- **Add Your API Key**: Unlock personalized AI analysis with your own Gemini API key
- **Secure & Private**: API keys are stored locally in your browser only
- **Direct Communication**: Your key communicates directly with Google's Gemini API
- **Full Control**: Easily add, update, or remove your API key anytime

## Features

### Core Functionality
-   **Digital Evidence Assessment**: Comprehensive evaluation framework based on legal standards
-   **Interactive Questionnaire**: Step-by-step guidance through evidence factors
-   **Legal Analysis Reports**: Detailed admissibility assessments with recommendations
-   **Progressive Enhancement**: Works with or without AI features

### AI-Enhanced Features (With API Key)
-   **AI-Powered Analysis**: Personalized legal insights using Google's Gemini AI
-   **Smart Recommendations**: Context-aware suggestions for evidence strengthening
-   **Interactive Assistant**: Real-time help with key points and critique
-   **Comprehensive Reports**: AI-generated legal analysis with specific recommendations

## 🌐 Live Demo

**Try it now**: [https://castle-bravo-project.github.io/proof-stack/](https://castle-bravo-project.github.io/proof-stack/)

- **No setup required** - Start exploring immediately in demo mode
- **Add your API key** - Unlock AI features with your free Gemini API key
- **Educational content** - Learn about digital evidence admissibility

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" and create a new key
4. Copy the key and add it to ProofStack using the banner at the top

**Your API key is completely private** - it's stored only in your browser and communicates directly with Google's servers.

## 💻 Local Development

### Web Application Development

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/castle-bravo-project/proof-stack.git
    cd proof-stack
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Web Version Locally:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173/proof-stack/`

    > **Note**: The web version shows "Browser Development Mode" warnings. This is normal and indicates you're running the development version. For full compliance features, use the desktop application.

4.  **Build Web Version for Production:**
    ```bash
    npm run build
    ```

### Desktop Application Development

The desktop version provides additional features like secure local database storage and eliminates browser limitations.

1.  **Run Desktop App in Development:**
    ```bash
    npm run electron:dev
    ```
    This launches the full desktop application with all features enabled.

2.  **Build Desktop App from Source:**

    **Windows:**
    ```bash
    npm run electron:build:win
    ```

    **macOS:**
    ```bash
    npm run electron:build:mac
    ```

    **Linux:**
    ```bash
    npm run electron:build:linux
    ```

    **All Platforms:**
    ```bash
    npm run electron:build
    ```

3.  **Desktop App Output:**
    - **Windows**: `dist-electron/ProofStack Legal Compliance Tool Setup X.X.X.exe`
    - **macOS**: `dist-electron/ProofStack Legal Compliance Tool-X.X.X.dmg`
    - **Linux**: `dist-electron/ProofStack Legal Compliance Tool-X.X.X.AppImage`

### Why Build from Source?

**For Users:**
- ✅ **No Security Warnings**: Self-built apps don't trigger "Unknown Publisher" warnings
- ✅ **Latest Features**: Access to the most recent code changes
- ✅ **Full Trust**: You control the entire build process
- ✅ **Customization**: Modify features to suit your needs

**For Developers:**
- ✅ **Development Environment**: Full debugging and development tools
- ✅ **Code Inspection**: Review all source code before building
- ✅ **Custom Builds**: Add your own features or modifications

## 🌐 Web vs Desktop Versions

### Web Version (Browser)
**Best for**: Quick access, trying out features, educational use

**Features:**
- ✅ **Instant Access**: No installation required
- ✅ **Cross-Platform**: Works on any device with a browser
- ✅ **Auto-Updates**: Always the latest version
- ✅ **Progressive Enhancement**: Full API key management
- ⚠️ **Browser Limitations**: Shows development mode warnings
- ⚠️ **No Local Database**: Evidence data not persistently stored

### Desktop Version (Electron App)
**Best for**: Professional use, legal compliance, data persistence

**Features:**
- ✅ **Native Experience**: Full desktop integration
- ✅ **SQLite Database**: Secure local storage for evidence and analysis
- ✅ **Professional Interface**: Native menus and keyboard shortcuts
- ✅ **Chain of Custody**: Built-in evidence tracking
- ✅ **No Browser Warnings**: Clean, professional interface
- ✅ **Offline Capable**: Core features work without internet
- ✅ **File Associations**: Open evidence files directly
- ✅ **Data Export**: Professional reporting and backup features

### When to Use Each Version

| Use Case | Web Version | Desktop Version |
|----------|-------------|-----------------|
| **Learning & Education** | ✅ Perfect | ✅ Good |
| **Quick Assessment** | ✅ Perfect | ✅ Good |
| **Professional Legal Work** | ⚠️ Limited | ✅ Recommended |
| **Evidence Storage** | ❌ No | ✅ Yes |
| **Compliance Documentation** | ⚠️ Limited | ✅ Full |
| **Multi-Case Management** | ❌ No | ✅ Yes |

## 🚀 Deployment

### Web Application
The web application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch:

1. **Builds** the application with Vite
2. **Deploys** to GitHub Pages
3. **Available** at the live demo URL above

### Desktop Application
Desktop builds are created locally or via GitHub Actions:

1. **Local Build**: Use the commands above to build from source
2. **GitHub Actions**: Automated builds for releases (when code signing is available)
3. **Distribution**: Ready for package managers and direct distribution

## 🏗️ Architecture

### Progressive Enhancement Design
- **Demo Mode**: Full functionality with educational content when no API key is present
- **AI Mode**: Enhanced features with personalized analysis when API key is provided
- **Graceful Degradation**: All components work seamlessly in both modes

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages with GitHub Actions
- **Testing**: Vitest with React Testing Library

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 Educational Value

ProofStack serves as both a practical tool and educational resource:

- **Legal Standards**: Learn about FRE 901, 902, and other evidence rules
- **Best Practices**: Understand chain of custody and authentication requirements
- **Real-world Application**: Practice with realistic evidence scenarios
- **AI Integration**: See how AI can enhance legal analysis while maintaining human oversight

## 🤝 Contributing

We welcome contributions! Areas where you can help:

- **Legal Content**: Improve educational materials and demo content
- **AI Prompts**: Enhance AI analysis quality and accuracy
- **UI/UX**: Improve user experience and accessibility
- **Testing**: Add test coverage and edge case handling
- **Documentation**: Expand guides and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://castle-bravo-project.github.io/proof-stack/](https://castle-bravo-project.github.io/proof-stack/)
- **Repository**: [https://github.com/castle-bravo-project/proof-stack](https://github.com/castle-bravo-project/proof-stack)
- **Get API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)

---

**Ready to get started?** Visit the [live demo](https://castle-bravo-project.github.io/proof-stack/) and start exploring digital evidence assessment today!
