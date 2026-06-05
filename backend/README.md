__# 📚 Library Management System (Backend)

A production-style backend application for managing library operations such as user authentication, book management, and transaction handling.

---

## 🚀 Tech Stack

- **Java 17**
- **Spring Boot**
- **Spring Security (JWT Authentication)**
- **MySQL**
- **Spring Data JPA (Hibernate)**
- **Maven**
- **Swagger (OpenAPI)**

---

## 🔐 Features

### 👤 Authentication & Authorization
- User registration & login
- JWT-based authentication
- Role-based access (ADMIN, USER)

### 📚 Book Management
- Add new books
- Fetch book details
- Unique ISBN validation

### 🔄 Transaction System
- Issue book to user
- Prevent duplicate issue
- Return book
- Track issue date, due date, return date
- Fine calculation (for late returns)

### ⚠️ Error Handling
- Global exception handling
- Clean API responses

---

## 🧱 Project Structure
src/main/java/com/library
├── controller
├── service
├── repository
├── entity
├── dto
├── security
├── exception
├── config


---

## 🔗 API Endpoints

### 🔐 Auth
- `POST /auth/register`
- `POST /auth/login`

### 📚 Books
- `POST /books`
- `GET /books`
- `GET /books/{id}`

### 🔄 Transactions
- `POST /issue`
- `POST /return`
- `GET /transactions`

---

## 🧪 How to Run Locally

### 1. Clone Repository
git clone https://github.com/Iampranjaldubey/Library-management-system.git
cd Library-management-system

### 2. Configure Database
Update application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/library_db
spring.datasource.username=your_username
spring.datasource.password=your_password

### 3.Run Application
mvn spring-boot:run