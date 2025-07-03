# Software Design Specification (SDS) for CI/CD Pipeline

## 1. Introduction

This document provides the detailed software design specification for the CI/CD Pipeline of the Smart Attendance System. This pipeline, implemented using GitHub Actions, is responsible for automating the integration, testing, and deployment processes for the Flutter mobile application and its associated Firebase backend infrastructure.

**Repository:** `REPO-010-DVO`
**Output Path:** `.github/workflows`
**Technology:** GitHub Actions, YAML, Flutter CLI, Firebase CLI

## 2. System Overview & Strategy

The CI/CD strategy is centered around two primary workflows operating on a `main` branch development model:

1.  **Pull Request Check (`pr-check.yml`):** A mandatory quality gate for all code changes proposed to the `main` branch. It ensures code style, quality, and functionality by running static analysis and a comprehensive suite of automated tests.
2.  **Main Branch Deployment (`deploy-main.yml`):** A continuous deployment workflow that triggers automatically upon a successful merge to the `main` branch. It builds all release artifacts and deploys them to the designated **staging environment**.

This strategy ensures that the `main` branch always represents a stable, tested, and deployable state of the application.

### 2.1. Environment Management

The pipeline will manage deployments to different environments as defined in `REQ-DX-007`. The `deploy-main.yml` workflow is specifically configured to target the **staging** environment. Production deployments will be handled by a separate, manually triggered workflow (outside the scope of this initial automated design).

### 2.2. Secrets Management

All sensitive data, including API keys, service account credentials, and signing keys, will be stored as encrypted secrets in the GitHub repository settings. The workflows will securely access these secrets at runtime.

**Required Secrets:**
*   `FIREBASE_SERVICE_ACCOUNT_STAGING`: JSON key for the service account with deployment permissions to the staging Firebase project.
*   `ANDROID_KEYSTORE_BASE64`: Base64 encoded Java Keystore file for signing the Android app.
*   `ANDROID_KEYSTORE_PASSWORD`: The password for the keystore.
*   `ANDROID_KEY_ALIAS`: The alias of the key to use for signing.
*   `ANDROID_KEY_PASSWORD`: The password for the key alias.
*   `APP_STORE_CONNECT_API_KEY_JSON`: JSON representation of the App Store Connect API Key (including `keyId`, `issuerId`, and the private key) for authenticating with Apple.

## 3. Workflow Specifications

### 3.1. Pull Request Check Workflow (`pr-check.yml`)

This workflow acts as the primary quality gate. It must pass before any pull request can be merged into the `main` branch.

**File Path:** `.github/workflows/pr-check.yml`

**Trigger:**
*   On `pull_request` events targeting the `main` branch.

yaml
name: PR Check
on:
  pull_request:
    branches: [ main ]
jobs:
  # Job specifications outlined below


**Jobs:**

#### 3.1.1. Job: `lint-and-format`
*   **Description:** Ensures code adheres to formatting and static analysis rules.
*   **Runner:** `ubuntu-latest`
*   **Steps:**
    1.  **Checkout Code:** Use `actions/checkout@v4`.
    2.  **Setup Flutter:** Use `subosito/flutter-action@v2` with the latest stable Flutter version and channel. Enable caching.
    3.  **Check Formatting:** Run `flutter format --set-exit-if-changed .` to fail the job if any files need reformatting.
    4.  **Run Linter:** Run `flutter analyze` to check for static analysis issues based on `flutter_lints`.

#### 3.1.2. Job: `unit-and-widget-tests`
*   **Description:** Executes all unit and widget tests to verify business logic and UI components in isolation.
*   **Runner:** `ubuntu-latest`
*   **Steps:**
    1.  **Checkout Code:** Use `actions/checkout@v4`.
    2.  **Setup Flutter:** Use `subosito/flutter-action@v2` with caching.
    3.  **Run Tests:** Execute `flutter test --coverage` to run all tests and generate a coverage report.
    4.  **Upload Coverage Report:** Use `actions/upload-artifact@v4` to upload the coverage report from `coverage/lcov.info`.

#### 3.1.3. Job: `integration-tests`
*   **Description:** Runs end-to-end integration tests on an Android emulator to validate full user flows.
*   **Runner:** `macos-latest` (to support both Android and iOS emulators/simulators in the future).
*   **Steps:**
    1.  **Checkout Code:** Use `actions/checkout@v4`.
    2.  **Setup Java:** Use `actions/setup-java@v4` (required for Android).
    3.  **Setup Flutter:** Use `subosito/flutter-action@v2` with caching.
    4.  **Run Android Emulator:** Use `reactivecircus/android-emulator-runner@v2` to start an Android emulator.
        *   **Configuration:** API level 33, target `google_apis`, x86_64 architecture.
    5.  **Run Integration Tests:** Execute `flutter test integration_test`.

### 3.2. Staging Deployment Workflow (`deploy-main.yml`)

This workflow automates the release of the application and backend services to the staging environment after a pull request is successfully merged into `main`.

**File Path:** `.github/workflows/deploy-main.yml`

**Trigger:**
*   On `push` events to the `main` branch.

yaml
name: Deploy to Staging
on:
  push:
    branches: [ main ]

# Concurrency setting to prevent multiple deployments from running at once
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  # Job specifications outlined below


**Jobs:**

#### 3.2.1. Job: `build`
*   **Description:** Builds and signs the Android and iOS release artifacts. This job runs first, and all subsequent deployment jobs depend on its success.
*   **Runner:** `macos-latest`
*   **Outputs:** This job will not have explicit outputs, but it will upload artifacts.
*   **Steps:**
    1.  **Checkout Code:** Use `actions/checkout@v4`.
    2.  **Setup Java:** Use `actions/setup-java@v4`.
    3.  **Setup Flutter:** Use `subosito/flutter-action@v2`.
    4.  **Get Dependencies:** Run `flutter pub get`.
    5.  **Decode Android Keystore:** Decode the `ANDROID_KEYSTORE_BASE64` secret and write it to a file.
    6.  **Build Android App Bundle:** Run `flutter build appbundle --release` with the appropriate credentials passed from secrets.
    7.  **Build iOS IPA:** Run `flutter build ipa --release --export-options-plist=path/to/ExportOptions.plist`.
    8.  **Upload Android Artifact:** Use `actions/upload-artifact@v4` to upload the generated `.aab` file.
    9.  **Upload iOS Artifact:** Use `actions/upload-artifact@v4` to upload the generated `.ipa` file.

#### 3.2.2. Job: `deploy-firebase-staging`
*   **Description:** Deploys Firebase assets (Functions, Firestore Rules, Storage Rules, Hosting) to the staging project.
*   **Dependencies:** `needs: build`
*   **Runner:** `ubuntu-latest`
*   **Steps:**
    1.  **Checkout Code:** Use `actions/checkout@v4`.
    2.  **Setup Node.js:** Use `actions/setup-node@v4`.
    3.  **Install Firebase CLI:** Run `npm install -g firebase-tools`.
    4.  **Authenticate to Google Cloud:** Use `google-github-actions/auth` with the `FIREBASE_SERVICE_ACCOUNT_STAGING` secret.
    5.  **Deploy Firebase Assets:** Run `firebase deploy --only functions,firestore,storage,hosting --project <your-staging-project-id> --non-interactive`.

#### 3.2.3. Job: `deploy-android-staging`
*   **Description:** Deploys the Android App Bundle to the Google Play Internal Testing track.
*   **Dependencies:** `needs: build`
*   **Runner:** `ubuntu-latest`
*   **Steps:**
    1.  **Download Android Artifact:** Use `actions/download-artifact@v4` to download the `.aab` file created in the `build` job.
    2.  **Upload to Play Store:** Use `r0adkll/upload-google-play@v1` action.
        *   **Configuration:** Provide the `serviceAccountJsonPlainText` (can be the same as `FIREBASE_SERVICE_ACCOUNT_STAGING`), `packageName`, `releaseFiles`, and `track: internal`.

#### 3.2.4. Job: `deploy-ios-staging`
*   **Description:** Deploys the iOS IPA to TestFlight for internal testing.
*   **Dependencies:** `needs: build`
*   **Runner:** `macos-latest`
*   **Steps:**
    1.  **Download iOS Artifact:** Use `actions/download-artifact@v4` to download the `.ipa` file.
    2.  **Upload to TestFlight:** Use `apple-actions/upload-testflight-build@v2`.
        *   **Configuration:** Provide the `api-key-json` (from `APP_STORE_CONNECT_API_KEY_JSON` secret), `app-bundle-id`, `ipa-path`, and other necessary identifiers.