
# Supabase Compliance Checker

This is a full-stack application designed to help customers check the compliance of their Supabase configuration. It verifies if:
- MFA (Multi-Factor Authentication) is enabled for each user.
- Row Level Security (RLS) is enabled for each table and whether policies are defined.
- PITR (Point in Time Recovery) is enabled for the database.

The application includes a frontend interface built using **Next.js** where customers can input their Supabase API key, run compliance checks, and view historical logs of past checks.

---

## Table of Contents
- [Setup](#setup)
- [Usage](#usage)
- [Flow](#flow)
- [SQL Commands](#sql-commands)
- [Features](#features)
- [How It Works](#how-it-works)

---

## Setup

1. Clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Supabase project details:

```bash
NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_PROJECT_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY>
SUPABASE_PLAN_TYPE=Free # Change this to 'Pro' or 'Enterprise' as applicable
```

4. Start the application:

```bash
npm run dev
```

5. The application will be accessible on `http://localhost:3000`.

---

## Usage

1. **Customer's Service API Key**:
   - The application requires the **Supabase Service API key** from the customer. This key is necessary to perform the compliance scans on their account, as it allows the application to access admin-level data, such as users and tables.
   
   - The customer will need to input their **Service API Key** into the application to run the compliance checks.

2. **Compliance Check**:
   - After entering the API key, the customer can click the "Run Compliance Check" button. The system will check the following:
     - **MFA status** of all users.
     - **RLS status** for all tables (whether RLS is enabled and whether any policies are defined).
     - **PITR status** of the database (depending on the subscription plan).

3. **Compliance Logs**:
   - The system automatically logs each compliance check, storing details such as MFA, RLS, and PITR statuses. Customers can view all past logs on the logs page.

---

## Flow

### Step 1: Input the API Key
The customer enters their **Service API Key** into the application. The key is used to authenticate with Supabase and retrieve details about their users and tables.

### Step 2: Run Compliance Check
Once the key is entered, the application makes an API request to:
- List all users and check their **MFA status**.
- Retrieve all tables and check whether **RLS is enabled** and if **any policies are defined**.
- Check the **PITR status** based on the customer's Supabase plan type. Since it isn't possible to determine this any other way (from what I can tell) we have to pull this info simply from what plan they have, which I have set as an environment variable.

### Step 3: Log the Results
The results are displayed to the customer on the interface, and at the same time, the results are logged in the Supabase database for future reference.

### Step 4: View Logs
The customer can access the **Compliance Logs** section to see the history of all compliance checks that have been run. Each log includes the user email, the date and time of the check, and the status of MFA, RLS, and PITR.

---

## SQL Commands

To ensure that **RLS status** checks work properly, the customer will need to run the following SQL commands to create custom functions in their Supabase database:

### 1. Enable Row Level Security (RLS)
Ensure that RLS is enabled on all relevant tables:

```sql
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
```

### 2. Custom SQL Function to Retrieve Public Tables
This function retrieves all tables from the **public schema** for the RLS checks:

```sql
CREATE OR REPLACE FUNCTION get_public_tables()
RETURNS TABLE (tablename text)
LANGUAGE sql
AS $$
  SELECT tablename 
  FROM pg_catalog.pg_tables 
  WHERE schemaname = 'public';
$$;
```

### 3. Custom SQL Function for RLS Status
This function checks if RLS is enabled for a specific table:

```sql
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity
  INTO rls_enabled
  FROM pg_class
  WHERE relname = table_name;
  
  RETURN rls_enabled;
END;
$$;
```

### 4. Define a Policy (if necessary)
If RLS is enabled, ensure that appropriate policies are defined:

```sql
CREATE POLICY "Allow all access" ON <table_name>
FOR SELECT
USING (true);
```

---

## Features

### 1. **Compliance Scan**:
- Verifies if **MFA is enabled** for all users.
- Checks if **RLS is enabled** for all tables and whether any policies are defined.
- Determines if **PITR is enabled** for the database (based on the customer’s Supabase plan).

### 2. **Compliance Logs**:
- Every compliance check is logged, including user details and the status of MFA, RLS, and PITR.
- Logs can be accessed and reviewed at any time.

---

## How It Works

### Frontend (Next.js)
- The frontend provides an interface where the customer enters their **Service API key** and runs the compliance check.
- After the check, the results are displayed, including MFA, RLS, and PITR statuses.
- The customer can also access historical compliance logs.

### Backend (Supabase Integration)
- When the compliance check is run, the backend uses the Supabase client to fetch data:
  - **Users**: Fetches all users and checks whether MFA is enabled.
  - **Tables**: Retrieves all tables and checks if **RLS** is enabled and whether any policies exist (using the custom SQL function).
  - **PITR**: Checks the plan type (Free, Pro, Enterprise) to determine the **PITR status**.
- The results of each compliance check are logged into a **compliance_logs** table.

---

## Conclusion

This Supabase Compliance Checker provides an easy way for customers to check the security settings of their Supabase projects. By verifying MFA, RLS, and PITR, the application helps customers ensure that their Supabase projects are configured for optimal security and compliance.

---

If you run into any issues, feel free to reach out or open a GitHub issue.

