sequenceDiagram
    actor "Cloud Scheduler" as REPO012SCHEDULER
    participant "DataArchivalFunction" as REPO009SVCARCHIVE
    participant "Firestore Database" as REPO003DB
    participant "Firebase Cloud Storage" as REPO013STORAGE

    REPO012SCHEDULER-REPO009SVCARCHIVE: 1. Trigger Archival Job (e.g., daily at 02:00 UTC)
    activate REPO009SVCARCHIVE

    REPO009SVCARCHIVE-REPO003DB: 2. Query all tenants
    activate REPO003DB
    REPO003DB--REPO009SVCARCHIVE: List of tenant IDs
    deactivate REPO003DB

    loop For each tenant in the list
        note over REPO009SVCARCHIVE: The archival function processes tenants one by one to isolate failures and respect individual retention policies.
        REPO009SVCARCHIVE-REPO003DB: 3.1. GetConfig(tenantId)
        activate REPO003DB
        REPO003DB--REPO009SVCARCHIVE: TenantConfig (contains dataRetentionDays)
        deactivate REPO003DB

        REPO009SVCARCHIVE-REPO009SVCARCHIVE: 3.2. Calculate cutoffTimestamp = now() - dataRetentionDays

        REPO009SVCARCHIVE-REPO003DB: 3.3. Query for records where timestamp n        activate REPO003DB
        REPO003DB--REPO009SVCARCHIVE: Stream
        deactivate REPO003DB

        alt [records found  0]
            REPO009SVCARCHIVE-REPO013STORAGE: 3.4.1. Stream records to /archives/{tenantId}/{YYYY-MM-DD}.ndjson
            activate REPO013STORAGE
            note right of REPO013STORAGE: Archived data is written in Newline Delimited JSON (NDJSON) format for easy processing by other tools.
            REPO013STORAGE--REPO009SVCARCHIVE: File write success confirmation
            deactivate REPO013STORAGE

            note over REPO009SVCARCHIVE: Deletion from Firestore only occurs AFTER the file has been successfully written to Cloud Storage to prevent data loss.
            REPO009SVCARCHIVE-REPO003DB: 3.4.2. Create Batched Write for deletion
            activate REPO003DB

            loop For each archived record ID
                REPO009SVCARCHIVE-REPO003DB: 3.4.2.1.1. batch.delete(recordId)
            end

            note left of REPO003DB: Firestore Batched Writes are used to efficiently delete up to 500 documents in a single atomic operation.
            REPO009SVCARCHIVE-REPO003DB: 3.4.3. Commit batched delete
            REPO003DB--REPO009SVCARCHIVE: Batch commit success
            deactivate REPO003DB

            REPO009SVCARCHIVE-REPO009SVCARCHIVE: 3.4.4. Log successful archival and purge for tenant
        end
    end
    deactivate REPO009SVCARCHIVE