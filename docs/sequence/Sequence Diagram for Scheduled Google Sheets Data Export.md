sequenceDiagram
    actor "Google Cloud Scheduler" as REPO012SCHEDULER
    participant "GoogleSheetsSyncFunction" as REPO008SVCEXPORT
    participant "Firestore Database" as REPO003DB
    participant "Google Sheets API" as REPO014EXTGSHEETS

    REPO012SCHEDULER-REPO008SVCEXPORT: 1. Trigger Export Job (Scheduled Pub/Sub)
    activate REPO008SVCEXPORT
    note right of REPO008SVCEXPORT: Function is idempotent; designed to handle multiple triggers for the same time window without duplicating data.

    REPO008SVCEXPORT-REPO003DB: 2. Get all tenants with active integrations (query linkedSheets collection)
    activate REPO003DB
    REPO003DB--REPO008SVCEXPORT: Return List of tenant integration documents
    deactivate REPO003DB

    loop For each tenant with an active integration
        REPO008SVCEXPORT-REPO003DB: 3.1 Query new, 'Approved' attendance records since last sync
        activate REPO003DB
        REPO003DB--REPO008SVCEXPORT: Return List of new attendance records
        deactivate REPO003DB

        alt New records found
            REPO008SVCEXPORT-REPO014EXTGSHEETS: 3.2.1.1 Append Formatted Records to Sheet (fileId, data)
            activate REPO014EXTGSHEETS
            note right of REPO008SVCEXPORT: Function retrieves stored OAuth 2.0 credentials for the tenant's admin to authenticate API calls.
            REPO014EXTGSHEETS--REPO008SVCEXPORT: Return API Response (Success or Error)
            deactivate REPO014EXTGSHEETS

            alt API call successful
                REPO008SVCEXPORT-REPO003DB: 3.2.1.2.1.1 Update Sync Status (status: 'Success', lastSyncTimestamp: now())
                activate REPO003DB
                REPO003DB--REPO008SVCEXPORT: Return Write Ack
                deactivate REPO003DB
            else API call fails - Permanent Error
                note right of REPO008SVCEXPORT: Circuit Breaker pattern: a permanent error (e.g., 403 Forbidden) will prevent future sync attempts for this tenant until re-linked by an Admin.
                REPO008SVCEXPORT-REPO003DB: 3.2.1.2.2.1 Update Sync Status (status: 'Failed', error: 'Permission denied')
                activate REPO003DB
                REPO003DB--REPO008SVCEXPORT: Return Write Ack
                deactivate REPO003DB
            else API call fails - Transient Error
                loop Retry up to 3 times with exponential backoff
                    REPO008SVCEXPORT-REPO008SVCEXPORT: 3.2.1.2.3.1 Attempt retry
                end
            end
        else No new records found
            REPO008SVCEXPORT-REPO003DB: 3.2.2.1 Update lastSyncTimestamp to now()
            activate REPO003DB
            REPO003DB--REPO008SVCEXPORT: Return Write Ack
            deactivate REPO003DB
        end
    end
    deactivate REPO008SVCEXPORT