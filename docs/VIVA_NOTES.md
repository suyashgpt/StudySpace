# StudySpace: Academic Practical Viva Defense Guide

**Degree:** Master of Computer Applications (MCA)  
**Institution:** Lovely Professional University (LPU)  
**Project Title:** Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)

This document is prepared specifically for your final practical viva evaluation. It organizes questions and answers into three distinct tiers: **Beginner**, **Intermediate**, and **Advanced**. Each entry provides a **Concise Spoken Viva Answer** (what you speak to the professor) followed by **Detailed Technical Background**.

---

## Part 1: Beginner Level Questions & Concepts

### Q1: What problem does StudySpace solve?
- **Spoken Viva Answer:**  
  *"StudySpace is designed for commercial study libraries and reading rooms where students rent seats for competitive exam preparation. Traditional centers use paper registers and spreadsheets, which lead to duplicate fee records, missed payments, unrecorded daily expenses, and inaccurate book tracking. StudySpace centralizes student admissions, attendance, monthly invoicing, partial fee collections, operational expenses, and book circulation into a single web application."*
- **Technical Detail:** It addresses data fragmentation and human error by enforcing database-level uniqueness, referential integrity, and automated balance calculations.

### Q2: What is CRUD, and where is it used in your project?
- **Spoken Viva Answer:**  
  *"CRUD stands for Create, Read, Update, and Delete. In StudySpace, it is implemented across all core modules: creating and editing student admissions, reading and filtering records, updating attendance and fee installments, and soft-deactivating records instead of hard deleting them to protect audit history."*

### Q3: What is React and why did you choose it for the frontend?
- **Spoken Viva Answer:**  
  *"React is a declarative, component-based JavaScript frontend library developed by Meta. I used React because it utilizes a Virtual DOM to re-render only the specific UI components that change when state updates—such as calculating fee balances or marking attendance—without reloading the whole web page."*

### Q4: What is TypeScript and how does it help your project?
- **Spoken Viva Answer:**  
  *"TypeScript is a strongly typed superset of JavaScript that compiles down to plain JavaScript. It provides static type checking at compile-time. In StudySpace, TypeScript interfaces strictly match our PostgreSQL database schemas, preventing runtime crashes and undefined field errors."*

### Q5: What is Vite and why is it preferred over Create React App (CRA)?
- **Spoken Viva Answer:**  
  *"Vite is a modern frontend build tool. Unlike older bundlers like Webpack in Create React App, Vite uses native ES modules during development and esbuild for pre-bundling, delivering instant server start and lightning-fast Hot Module Replacement (HMR)."*

### Q6: What is a Relational Database and why PostgreSQL?
- **Spoken Viva Answer:**  
  *"A relational database organizes data into structured tables with rows and columns linked by primary and foreign keys. I chose PostgreSQL because it is an enterprise-grade open-source object-relational database known for strict ACID compliance, robust Row Level Security (RLS), and precise numeric data types for financial computations."*

---

## Part 2: Intermediate Level Questions & Implementation

### Q7: What are Primary Keys and Foreign Keys, and how are they used in StudySpace?
- **Spoken Viva Answer:**  
  *"A Primary Key uniquely identifies each row in a table. In StudySpace, we use UUIDs generated via `gen_random_uuid()` as primary keys. A Foreign Key is a column that links a record in one table to the primary key of another. For example, `student_id` in `fee_invoices` links each invoice to a valid student in the `students` table."*

### Q8: What is Database Normalization and to what normal form is your schema normalized?
- **Spoken Viva Answer:**  
  *"Database normalization is the systematic design process of eliminating data redundancy and dependency anomalies. The StudySpace schema is normalized up to Third Normal Form (3NF). Atomic values satisfy 1NF, primary key dependencies satisfy 2NF, and transitive dependencies are eliminated to satisfy 3NF (e.g., student shift details are stored in `shift_types` rather than duplicated in every student row)."*

### Q9: What is the difference between Authentication and Authorization in your system?
- **Spoken Viva Answer:**  
  *"Authentication verifies identity—answering 'Who are you?' using Supabase Auth with encrypted passwords and JWT tokens. Authorization determines access rights—answering 'What are you allowed to do?' enforced at the database level using PostgreSQL Row Level Security (RLS) policies."*

### Q10: What is Supabase and what is its role in your architecture?
- **Spoken Viva Answer:**  
  *"Supabase is an open-source Backend-as-a-Service (BaaS) built on PostgreSQL. In our project, it provides the managed PostgreSQL database, auto-generated REST APIs via PostgREST, user authentication, and Row Level Security, eliminating the need to write and maintain a separate Node/Express backend."*

### Q11: How is the payment status of an invoice derived in StudySpace?
- **Spoken Viva Answer:**  
  *"Payment status is never hardcoded. It is derived using Algorithm 4 (`calculateFeeBalance`). The system sums all valid payments recorded against that invoice. If total paid is zero, status is `pending`; if greater than zero but less than the amount due, status is `partial`; once total paid equals or exceeds the amount due, status becomes `paid`."*
- **Source File:** [`src/lib/calculations.ts`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/src/lib/calculations.ts)

### Q12: How do you prevent duplicate attendance for a student on the same day?
- **Spoken Viva Answer:**  
  *"Duplicate attendance is prevented at both the database and application levels. In PostgreSQL, we created a composite unique constraint: `CONSTRAINT uq_student_attendance_date UNIQUE (student_id, attendance_date)`. When an administrator marks attendance, the application performs an `UPSERT` (`INSERT ... ON CONFLICT DO UPDATE`), which updates the existing day's record rather than inserting a duplicate."*
- **Source File:** [`src/services/attendanceService.ts`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/src/services/attendanceService.ts) and [`supabase/migrations/20261024_initial_schema.sql`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/supabase/migrations/20261024_initial_schema.sql).

### Q13: How is real-time book availability maintained without data drift?
- **Spoken Viva Answer:**  
  *"We do not store an editable availability counter that can drift out of sync. Instead, Algorithm 6 dynamically calculates available copies as: `availableCopies = totalCopies - activeLoansCount`, where active loans are those where `returned_at IS NULL`. When a book is returned, `returned_at` is stamped, which immediately restores copy availability."*

---

## Part 3: Advanced Level Questions & Viva Traps

### Q14: What is Row Level Security (RLS) and why is it superior to frontend protection?
- **Spoken Viva Answer:**  
  *"Frontend route protection can easily be bypassed by opening developer tools or issuing curl requests directly to the API endpoint. Row Level Security is enforced by the PostgreSQL database engine itself. Every query is filtered by security policies (`USING (auth.uid() IS NOT NULL)`), ensuring that unauthenticated requests are physically rejected at the database layer regardless of the client."*

### Q15: Why did you use `NUMERIC(10, 2)` instead of `FLOAT` or `DOUBLE` for financial amounts?
- **Spoken Viva Answer:**  
  *"Floating-point types in computers use binary IEEE 754 representations, which cannot accurately represent base-10 fractions, leading to rounding errors (such as 0.1 + 0.2 = 0.30000000000000004). For library fees and accounting, we must use `NUMERIC(10, 2)` (fixed-point arithmetic) to ensure zero precision loss."*

### Q16: How did you test the application?
- **Spoken Viva Answer:**  
  *"We implemented automated unit tests using Vitest covering our pure algorithms: Algorithm 4 (fee balance and partial payment calculations), Algorithm 5 (expense categorization), Algorithm 6 (book copy availability), and Algorithm 8 (RFC-4180 CSV escaping). We also created a 26-point verification test matrix covering authentication, duplicate prevention, and responsive views."*

### Q17: What are the current limitations and future scope of StudySpace?
- **Spoken Viva Answer:**  
  *"The current version focuses on single-facility administrative operations with manual receipt logging. Future extensions could integrate biometric fingerprint/turnstile hardware for automated check-in, an automated SMS/WhatsApp gateway for payment reminders, and student self-service seat booking via UPI gateways like Razorpay."*
