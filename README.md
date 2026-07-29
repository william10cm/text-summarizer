# Text Summarizer

A text summarizer built with Anthropic Claude, React, TypeScript, AWS API Gateway, S3, CloudFront, and GitHub Actions.

## Overview

This project provides a web-based interface for summarizing text using Anthropic's Claude API. The frontend is built with React and TypeScript, and the app is deployed on AWS using:

- **Amazon S3** for hosting static assets
- **Amazon CloudFront** for CDN delivery
- **AWS API Gateway** to expose backend endpoints
- **GitHub Actions** for CI/CD automation

## Features

- Summarize long-form text into concise output
- React + TypeScript frontend
- Cloud-hosted deployment pipeline
- Automated builds and deployments via GitHub Actions

## Tech Stack

- JavaScript
- TypeScript
- React
- Anthropic Claude API
- AWS API Gateway
- Amazon S3
- Amazon CloudFront
- GitHub Actions

## Getting Started

> Replace the commands below with the exact scripts used in this repository if they differ.

### Prerequisites

- Node.js
- npm or yarn
- Access to Anthropic Claude API credentials
- AWS credentials for deployment, if applicable

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

Deployment is handled through GitHub Actions and AWS infrastructure in this project.

## Environment Variables

If your app uses environment variables, create a `.env` file with the required keys. Common examples may include:

- `ANTHROPIC_API_KEY`
- `API_URL`
- `AWS_REGION`

## Contributing

Contributions are welcome. Feel free to open issues or submit pull requests.

## License

Add license information here if applicable.
