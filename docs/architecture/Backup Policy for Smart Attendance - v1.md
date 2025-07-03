# Specification

# 1. Ci Cd Pipeline Design

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Technology Stack:**
    
    - Flutter
    - Firebase Cloud Functions (TypeScript)
    - Firebase Firestore
    - GitHub Actions
    
  - **Deployment Environments:**
    
    - development
    - staging
    - production
    
  - **Key Requirements:**
    
    - REQ-DX-001: Automated building, testing, and deployment
    - REQ-DX-007: Separate Firebase projects for dev, staging, prod
    - REQ-6.10: 80% minimum test coverage
    - REQ-11-005: Automated dependency vulnerability scanning
    - REQ-7.1: Publish AAB for Android and use TestFlight for iOS
    
  
- **Pipelines:**
  
  - **Pipeline Name:** FlutterAppPipeline  
**Description:** Handles the CI/CD for the cross-platform Flutter mobile application. It builds, tests, analyzes, and deploys the app to mobile distribution channels.  
**Trigger Events:**
    
    - push to feature/*
    - pull_request to main
    - push on tag v*.*.*
    
**Stages:**
    
    - **Build And Test Automation:**
      
      - **Build Stages:**
        
        - **Name:** Build Android App Bundle (AAB)  
**Runner:** ubuntu-latest  
**Steps:**
    
    - Checkout code
    - Setup Flutter SDK
    - Restore dependencies (`flutter pub get`)
    - Build AAB for release (`flutter build aab --release`)
    
**Artifacts:**
    
    - app-release.aab
    
        - **Name:** Build iOS Archive (IPA)  
**Runner:** macos-latest  
**Steps:**
    
    - Checkout code
    - Setup Flutter SDK
    - Restore dependencies (`flutter pub get`)
    - Build IPA for release (`flutter build ipa --release`)
    
**Artifacts:**
    
    - Runner.ipa
    
        
      - **Testing Needs:**
        
        - **Name:** Unit & Widget Tests  
**Command:** flutter test --machine --coverage  
**Environment:** Flutter SDK on ubuntu-latest  
**Reporting:** Generate JUnit XML and lcov.info reports.  
        - **Name:** Integration/E2E Tests  
**Command:** flutter test integration_test  
**Environment:** Requires Android Emulator / iOS Simulator. Run as a separate, longer job.  
**Notes:** Essential for validating full user flows before deployment to staging, as per REQ-2.1.1.  
        
      
    - **Code Quality And Security Analysis:**
      
      - **Static Code Analysis:**
        
        - **Tool:** flutter_lints
        - **Command:** flutter analyze
        - **Notes:** Mandatory check on every PR to enforce consistent code style, as per REQ-DX-002.
        
      - **Security Scanning:**
        
        - **Tool:** GitHub Dependabot
        - **Notes:** Configured at the repository level to automatically scan for vulnerabilities in pubspec.yaml, fulfilling REQ-11-005.
        
      - **Code Coverage:**
        
        - **Tool:** lcov / genhtml
        - **Minimum Threshold:** 80
        - **Notes:** Enforces the 80% test coverage target from REQ-6.10. Fails the pipeline if coverage drops below the threshold.
        
      
    - **Deployment Strategy:**
      
      - **Deployment Pattern:** Progressive Deployment to testing tracks
      - **Environment Promotion:** Staging (Firebase App Distribution / TestFlight) -> Manual Promotion to Production (App Store / Play Store)
      - **Environment Variables:**
        
        - **Management:** GitHub Secrets
        - **Variables:**
          
          - FIREBASE_OPTIONS_STAGING
          - FIREBASE_OPTIONS_PRODUCTION
          - ANDROID_KEYSTORE_BASE64
          - ANDROID_KEYSTORE_PASSWORD
          - IOS_P12_BASE64
          - IOS_PROVISIONING_PROFILE_BASE64
          - MATCH_PASSWORD
          
        
      
    - **Quality Gates And Approval:**
      
      - **Automated Gates:**
        
        - Static analysis (lint) must pass.
        - All unit and widget tests must pass.
        - Code coverage must be >= 80%.
        - Integration tests must pass on pull requests to main.
        
      - **Manual Approvals:**
        
        - **Environment:** Production Release  
**Approvers:** Release Managers  
**Notes:** A manual approval step in GitHub Actions before publishing to public-facing TestFlight or Google Play tracks.  
        
      
    - **Artifact Management:**
      
      - **Versioning Strategy:** Semantic Versioning with build numbers from Git tags (e.g., v1.2.3+45).
      - **Repository:** GitHub Releases
      - **Retention:** Indefinite for all tagged releases.
      - **Signing:** Automated signing for both Android (Keystore) and iOS (Certificates/Profiles) using secrets.
      
    - **Rollback And Recovery:**
      
      - **Mechanism:** Manual promotion of a previous stable build from the respective App/Play Store console.
      - **Monitoring Integration:** Pipeline failure notifications. Post-deployment monitoring relies on Firebase Crashlytics alerts (REQ-MAA-005) to inform rollback decisions.
      
    
  - **Pipeline Name:** FirebaseBackendPipeline  
**Description:** Handles the CI/CD for all Firebase backend assets, including Cloud Functions, Firestore Security Rules, and Indexes.  
**Trigger Events:**
    
    - push to develop
    - push to main
    - push on tag v*.*.*
    
**Stages:**
    
    - **Build And Test Automation:**
      
      - **Build Stages:**
        
        - **Name:** Build TypeScript Functions  
**Runner:** ubuntu-latest  
**Steps:**
    
    - Checkout code
    - Setup Node.js (LTS)
    - Install dependencies (`npm ci` in functions directory)
    - Compile TypeScript (`npm run build`)
    
**Artifacts:**
    
    - functions/lib directory
    
        
      - **Testing Needs:**
        
        - **Name:** Unit Tests (Jest)  
**Command:** npm test -- --coverage  
**Environment:** Node.js environment with mocked Firebase dependencies.  
**Reporting:** Generate JUnit XML and lcov reports.  
        - **Name:** Emulator Integration Tests  
**Command:** npm run test:emulators  
**Environment:** Spins up the Firebase Local Emulator Suite (Firestore, Functions, Auth) to test function triggers and security rules together.  
**Notes:** Crucial for validating the multi-tenant security rules and data access logic as per REQ-2.2.  
        
      
    - **Code Quality And Security Analysis:**
      
      - **Static Code Analysis:**
        
        - **Tool:** ESLint
        - **Command:** npm run lint
        - **Notes:** Ensures code quality and consistency for all TypeScript Cloud Functions.
        
      - **Security Scanning:**
        
        - **Tool:** npm audit
        - **Command:** npm audit --audit-level=high
        - **Notes:** Checks for vulnerabilities in backend dependencies, fulfilling REQ-11-005.
        
      - **Code Coverage:**
        
        - **Tool:** Jest Coverage Reporter
        - **Minimum Threshold:** 80
        - **Notes:** Enforces the 80% test coverage target from REQ-6.10 for backend business logic.
        
      
    - **Deployment Strategy:**
      
      - **Deployment Pattern:** Direct deployment to dedicated environments.
      - **Environment Promotion:** develop -> `development` Firebase project, main -> `staging` Firebase project, tags -> `production` Firebase project.
      - **Environment Variables:**
        
        - **Management:** GitHub Secrets
        - **Variables:**
          
          - FIREBASE_TOKEN
          - GCP_SA_KEY_DEVELOPMENT
          - GCP_SA_KEY_STAGING
          - GCP_SA_KEY_PRODUCTION
          
        
      - **Iac Integration:** Firestore rules (`firestore.rules`), indexes (`firestore.indexes.json`), and hosting configuration (`firebase.json`) are versioned in Git and deployed via the pipeline.
      
    - **Quality Gates And Approval:**
      
      - **Automated Gates:**
        
        - ESLint must pass.
        - All unit tests must pass.
        - Code coverage must be >= 80%.
        - All emulator-based integration tests must pass.
        
      - **Manual Approvals:**
        
        - **Environment:** Production  
**Approvers:** DevOps Lead, Engineering Manager  
**Notes:** A mandatory manual approval gate in GitHub Actions before any deployment to the production Firebase project, as per REQ-2.3.  
        
      
    - **Artifact Management:**
      
      - **Versioning Strategy:** Code is versioned via Git. Deployments are tied to specific commit hashes.
      - **Repository:** N/A - Direct deployment from source.
      - **Retention:** N/A
      - **Signing:** N/A
      
    - **Rollback And Recovery:**
      
      - **Mechanism:** Re-running the deployment job with a previous stable Git commit/tag.
      - **Monitoring Integration:** Pipeline failure notifications. Post-deployment monitoring via Google Cloud Monitoring alerts for function errors/latency informs rollback decisions.
      
    
  


---

