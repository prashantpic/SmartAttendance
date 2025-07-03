# Specification

# 1. Pipelines

## 1.1. Flutter Mobile App CI/CD
Builds, tests, and deploys the cross-platform Flutter application for Android and iOS. Triggered on push to any branch and handles automated deployment to internal testing tracks on merge to main.

### 1.1.4. Stages

### 1.1.4.1. Setup and Analyze
#### 1.1.4.1.2. Steps

- actions/checkout@v4
- actions/setup-java@v4 --distribution 'temurin' --java-version '17'
- subosito/flutter-action@v2 --flutter-version '3.x'
- flutter pub get
- flutter analyze --fatal-infos

#### 1.1.4.1.3. Environment


#### 1.1.4.1.4. Quality Gates

- **Name:** Static Code Analysis  
**Criteria:**
    
    - flutter analyze passes with zero info, warning, or error level issues
    
**Blocking:** True  

### 1.1.4.2. Unit, Widget, and Integration Tests
#### 1.1.4.2.2. Steps

- flutter test --coverage
- flutter test integration_test/

#### 1.1.4.2.3. Environment


#### 1.1.4.2.4. Quality Gates

- **Name:** Test Suite Pass  
**Criteria:**
    
    - All unit, widget, and integration tests must pass
    
**Blocking:** True  
- **Name:** Code Coverage Check  
**Criteria:**
    
    - Test coverage >= 80%
    
**Blocking:** True  

### 1.1.4.3. Dependency Security Scan
#### 1.1.4.3.2. Steps

- dependency-vulnerability-scan --fail-on-critical

#### 1.1.4.3.3. Environment

- **Scan_Target:** pubspec.yaml

#### 1.1.4.3.4. Quality Gates

- **Name:** Vulnerability Check  
**Criteria:**
    
    - No critical or high severity vulnerabilities found in dependencies
    
**Blocking:** True  

### 1.1.4.4. Build Release Artifacts
#### 1.1.4.4.2. Steps

- flutter build appbundle --release
- flutter build ipa --release
- actions/upload-artifact@v4 --name android-release --path build/app/outputs/bundle/release/app-release.aab
- actions/upload-artifact@v4 --name ios-release --path build/ios/ipa/App.ipa

#### 1.1.4.4.3. Environment

- **Build_Number:** ${{ github.run_number }}
- **Build_Version:** 1.0.${{ github.run_number }}

### 1.1.4.5. Deploy to Internal Testing
#### 1.1.4.5.2. Steps

- deploy-to-play-store --track internal --aab build/app/outputs/bundle/release/app-release.aab
- deploy-to-testflight --ipa build/ios/ipa/App.ipa

#### 1.1.4.5.3. Environment

- **Note:** This stage is configured to run only on merge to 'main' branch

#### 1.1.4.5.4. Quality Gates

- **Name:** Manual QA Sign-off  
**Criteria:**
    
    - Build successfully tested and approved by QA team on TestFlight and Google Play Internal Testing tracks
    
**Blocking:** True  


## 1.2. Firebase Backend CI/CD
Tests and deploys Firebase assets, including Cloud Functions (TypeScript), Firestore security rules, and indexes, across staging and production environments.

### 1.2.4. Stages

### 1.2.4.1. Setup, Lint, and Test Functions
#### 1.2.4.1.2. Steps

- actions/checkout@v4
- actions/setup-node@v4 --node-version '20.x'
- npm install --prefix functions
- npm run lint --prefix functions
- npm test --prefix functions

#### 1.2.4.1.3. Environment


#### 1.2.4.1.4. Quality Gates

- **Name:** Backend Test Pass  
**Criteria:**
    
    - All unit tests for Cloud Functions must pass
    
**Blocking:** True  

### 1.2.4.2. Validate Firestore Security Rules
#### 1.2.4.2.2. Steps

- firebase emulators:start --only firestore,auth,functions --import=./test-data
- firebase emulators:exec 'npm run test:rules --prefix functions'

#### 1.2.4.2.3. Environment

- **Firebase_Project_Id:** local-test-project

#### 1.2.4.2.4. Quality Gates

- **Name:** Security Rules Validation  
**Criteria:**
    
    - All Firestore security rule tests must pass in the local emulator
    
**Blocking:** True  

### 1.2.4.3. Deploy to Staging Environment
#### 1.2.4.3.2. Steps

- firebase deploy --only functions,firestore --project smart-attendance-staging --token ${{ secrets.FIREBASE_TOKEN }}

#### 1.2.4.3.3. Environment

- **Note:** This stage is configured to run only on merge to 'staging' branch

#### 1.2.4.3.4. Quality Gates


### 1.2.4.4. Deploy to Production Environment
#### 1.2.4.4.2. Steps

- firebase deploy --only functions,firestore --project smart-attendance-production --token ${{ secrets.FIREBASE_TOKEN }}

#### 1.2.4.4.3. Environment

- **Note:** This stage requires manual approval and is triggered on merge to 'main' branch

#### 1.2.4.4.4. Quality Gates

- **Name:** Manual Production Approval  
**Criteria:**
    
    - Deployment to production requires manual sign-off from the Engineering Lead
    
**Blocking:** True  




---

# 2. Configuration

- **Artifact Repository:** GitHub Packages
- **Default Branch:** main
- **Retention Policy:** 90d
- **Notification Channel:** slack#cicd-notifications


---

