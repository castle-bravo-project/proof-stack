# ProofStack MVP

![CI Status](https://github.com/YOUR_USERNAME/proofstack-mvp/workflows/CI/badge.svg)
![Deployment Status](https://github.com/YOUR_USERNAME/proofstack-mvp/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Introduction

ProofStack MVP (Minimum Viable Product) is a demonstration of a GitHub App designed to help manage software development documentation, requirements, and compliance artifacts directly within your GitHub repository. This MVP focuses on providing visibility into the status of key project documents and requirements.

**Meta-Compliance Demonstration:** This repository serves as a live demonstration of meta-compliance. The ProofStack MVP tool itself is being developed and deployed from *this very repository*, and it uses the `ignition-project.json` file within this repository as its input data. This showcases the tool's capability by having it process the artifacts of its own development project.

## Features

-   **Document Tracking:** View the status and completion progress of key project documentation (SDP, CM Plan, QA Procedures, SRS, etc.).
-   **Requirements Listing:** Browse defined project requirements with their priority and status.
-   **Compliance Overview:** Gain insight into the project's adherence to defined documentation and requirements standards.
-   **GitHub Pages Deployment:** The application is deployed as a static site to GitHub Pages directly from the `main` branch using GitHub Actions.
-   **GitHub App Manifest:** Includes a manifest ready for potential GitHub Marketplace listing.

## Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/proofstack-mvp.git
    cd proofstack-mvp
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Locally (Development):**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port). It will load the `ignition-project.json` file from the public directory.

4.  **Build for Production:**
    ```bash
    npm run build
    ```
    This creates the static site in the `dist` directory.

5.  **Deploy to GitHub Pages:**
    This is automated via the `.github/workflows/deploy.yml` GitHub Actions workflow. Pushing changes to the `main` branch will trigger a build and deployment to the `gh-pages` branch, serving the application at `https://YOUR_USERNAME.github.io/proofstack-mvp/`.

6.  **Install as a GitHub App (Optional):**
    If you wish to register this as a GitHub App, you can use the `github-app-manifest.json`. Note that this MVP is primarily a frontend application deployed on Pages and may not fully utilize advanced GitHub App features like webhooks without a separate backend component. The manifest is included for demonstration and potential future expansion.

## Meta-Compliance Explained

The `ignition-project.json` file in the root of this repository contains structured data describing the ProofStack MVP project itself – its documents, requirements, and compliance goals. The deployed ProofStack MVP application (which runs from this same repo's code) reads and displays this `ignition-project.json`. This loop—where the tool's own development data is the input for the tool—is the core of the meta-compliance demonstration.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. (Note: LICENSE file not generated in this output, but implied).

## Screenshots

*(Placeholder for screenshots of the deployed application)*

---

*Replace `YOUR_USERNAME` with your actual GitHub username in the badges and URLs.*