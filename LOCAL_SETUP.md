# Local Setup Guide

Follow these steps to run the Library Management System locally on your machine.

## 1. Database Setup

The backend expects a MySQL database and relies on several environment variables. You must have a MySQL server running locally (or remotely) and create an empty database for the application (e.g., `library_db`).

## 2. Backend Setup (IntelliJ IDEA)

Since you are using IntelliJ IDEA with built-in Maven, follow these steps to configure and run the backend:

1. **Open the Project**: Open the `Library-management-system/backend` folder as a project in IntelliJ IDEA.
2. **Sync Maven**: IntelliJ should automatically detect the `pom.xml` and sync the Maven dependencies. If not, open the Maven tool window (View > Tool Windows > Maven) and click "Reload All Maven Projects".
3. **Configure Environment Variables**:
   - Go to **Run > Edit Configurations**.
   - Select your Spring Boot application configuration (usually `LibraryApplication`).
   - In the **Environment variables** field, add the following variables (replace with your actual database and JWT credentials):
     ```text
     DB_URL=jdbc:mysql://localhost:3306/library_db;DB_USERNAME=root;DB_PASSWORD=your_password;JWT_SECRET=your_super_secret_jwt_key_that_is_at_least_256_bits;MAIL_USERNAME=your_email@gmail.com;MAIL_PASSWORD=your_app_password
     ```
     *(Note: `MAIL_USERNAME` and `MAIL_PASSWORD` are optional if you aren't testing email sending locally, but `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` are strictly required).*
4. **Run the Application**: Click the **Run** (green play button) in IntelliJ. The backend should start on `http://localhost:8080`. Flyway will automatically migrate your database tables.

## 3. Frontend Setup

The frontend is a Next.js application.

1. Open a terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Your `.env.local` is already configured correctly:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000`.

## Swagger API Documentation

Once the backend is running, you can explore and test the API directly via the Swagger UI at:
- **http://localhost:8080/swagger-ui.html**
