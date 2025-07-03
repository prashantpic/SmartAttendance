# Specification

# 1. Dashboards

## 1.1. Production Health & Operations
Primary dashboard for monitoring real-time system health, performance SLOs, and backend service status. Used for incident response by the development and operations team.

### 1.1.3. Type
operational

### 1.1.4. Panels

- **Title:** Service Availability (SLO)  
**Type:** gauge  
**Metrics:**
    
    - service.availability.rate
    
- **Title:** App Crash-Free Users  
**Type:** gauge  
**Metrics:**
    
    - client.crash_free_users.rate
    
- **Title:** Cloud Function Health (Error Rate & P95 Latency)  
**Type:** line_chart  
**Metrics:**
    
    - cloud_function.error.rate
    - cloud_function.execution_time
    
- **Title:** Firestore Performance (P95 Operation Latency)  
**Type:** line_chart  
**Metrics:**
    
    - firestore.operation.latency
    
- **Title:** User Check-In P95 Latency (SLO)  
**Type:** line_chart  
**Metrics:**
    
    - transaction.attendance_check_in.latency
    
- **Title:** GCP Monthly Cost (Forecasted)  
**Type:** stat  
**Metrics:**
    
    - gcp.project.cost
    

## 1.2. Business & Product KPIs
High-level dashboard for tracking user engagement, business growth, and operational efficiency. Used by product and management teams.

### 1.2.3. Type
business

### 1.2.4. Panels

- **Title:** Total Tenant Signups  
**Type:** stat  
**Metrics:**
    
    - tenant.signups.count
    
- **Title:** Daily Active Users (DAU)  
**Type:** line_chart  
**Metrics:**
    
    - users.daily_active.count
    
- **Title:** Daily Attendance Records Created  
**Type:** line_chart  
**Metrics:**
    
    - attendance.records.created_per_day
    
- **Title:** Supervisor Time-to-Action (Approvals)  
**Type:** histogram  
**Metrics:**
    
    - attendance.approval.time_to_action
    

## 1.3. External Integrations Health
Monitors the performance and reliability of critical third-party service integrations, such as Google Sheets and Geocoding APIs.

### 1.3.3. Type
integration

### 1.3.4. Panels

- **Title:** Google Sheets Sync Job Status (Last 24h)  
**Type:** table  
**Metrics:**
    
    - job.sheets_sync.status
    
- **Title:** Google Sheets API P95 Latency  
**Type:** line_chart  
**Metrics:**
    
    - dependency.api.latency.sheets
    
- **Title:** Google Geocoding API Error Rate  
**Type:** line_chart  
**Metrics:**
    
    - dependency.api.error_rate.geocoding
    



---

