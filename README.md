# 🧾 Case Fetcher App

A full-stack web application to fetch Delhi High Court case data based on user input. It maintains session state to bypass CAPTCHA restrictions and stores session and result logs in a PostgreSQL database.

---

## 🏛️ Court Chosen

**Delhi High Court**  
Website:
 - [https://delhihighcourt.nic.in](https://delhihighcourt.nic.in)
 - [https://dhccaseinfo.nic.in/pcase/guiCaseWise.php](https://dhccaseinfo.nic.in/pcase/guiCaseWise.php)

This app interacts with the Delhi High Court website to fetch publicly available metadata about court cases using provided case details and CAPTCHA.

---

## ⚙️ Features

- 🧠 Smart session-based scraping using Playwright
- 🧾 CAPTCHA fetching and manual input by user
- 🗃️ Case details stored in PostgreSQL database deployed using render.com
- 💻 Full-stack architecture (Node + React + Express + PostgreSQL)

---

## 🧪 Tech Stack
- Frontend: React.js
- Backend: Express.js, Node.js
- Database: PostgreSQL
- Web Scraping: Playwright

---

## 🚀 Setup Instructions

### 1. Clone the Repository

### 2. After cloning run the following commands:

## Backend
cd server
npm install

## Frontend
cd ../client
npm install

---

## 3.🌱 Sample .env File
## Create a .env file inside your /server and /client directory:

## - /client/.env

 - REACT_APP_SERVER_URL = http://localhost:5000

## - /server/.env

 - PORT = 5000
 - DATABASE_URL = Your database connection string

---

## 4. Running the Application

### Run Backend

 - cd/server
 - node index.js

### Run Frontend
 - Open a new Terminal and keep the previous one open
 - cd/client
 - npm start

---

## Note - The database is deployed using render.com, which expires on August 31, 2025. So, I suggest you use your local database using pgAdmin and create the tables

### user_search - table to store form input

CREATE TABLE user_search (
  id SERIAL PRIMARY KEY,
  case_type VARCHAR(50),
  case_number VARCHAR(50),
  filing_year VARCHAR(10),
);

### result_logs - table to store scraped case data

CREATE TABLE result_logs (
  id SERIAL PRIMARY KEY,
  case_no VARCHAR(100),
  filing_date VARCHAR(50),
  cnr VARCHAR(100),
  reg_date VARCHAR(50),
  status TEXT,
  advocate TEXT
);

---

# 🔐 CAPTCHA Strategy

## To comply with the Delhi High Court's security, CAPTCHA is **manually solved by the user**, while the session is managed programmatically:

1. **Start Session:**
   Backend (Playwright) opens the court's site and fetches a CAPTCHA image.

2. **Send CAPTCHA to Frontend:**
   The image is sent as base64. The user sees it and enters the text.

3. **Preserve Session:**
   A session ID keeps the same browser instance alive between CAPTCHA fetch and form submission.

4. **Submit Form:**
   Backend fills the form with user inputs and scrapes the resulting case data.

> ⚠️ CAPTCHA is not bypassed — user solves it manually, ensuring ethical scraping.

---

# Blockers

## 1. Downloading Liked PDFs
I wasn’t able to implement the PDF download feature in this app because the process was more complex than regular data scraping, involving dynamic links, sessions, and binary file handling. Moreover, the PDF files on the court website were behind JavaScript-based navigation or dynamic links, which made them hard to access through basic scraping.



