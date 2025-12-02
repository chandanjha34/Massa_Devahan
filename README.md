# 🚗 DeVahan – Decentralized Vehicle Intelligence Network

A decentralized ecosystem for **vehicle identity, data integrity, and AI-powered lifecycle management**, built on **Massa Network and deployed on Massa Deweb**.

**Status:** Production Ready ✅ | **Version:** 1.0

---

## 📋 Table of Contents

1. Quick Start
2. Architecture Overview
3. Features
4. API Documentation
5. Project Structure
6. Setup Instructions
7. How to Use
8. AI Model Training
9. Massa tech stack Integration
10. Troubleshooting
11. Future Roadmap
12. Contributing
13. License

---

## 🚀 Quick Start

### 1️⃣ Prerequisites

* Node.js v20+
* npm v10+
* Bearby wallet or Massa Station 
* Massa tokens

### 2️⃣ Installation

```bash
https://github.com/chandanjha34/Massa_DeVahan.git
cd Massa_DeVahan

cd Backend
npm install

cd Frontend
npm install

cd massa-contract
npm install


```

### 3️⃣ Environment Setup

Create a `.env` file:

# Backend Folder

PORT=3000
MONGO_URI=mongodb+srv://your_MongoDB_URI
JWT_SECRET = JWT_secret
PRIVATE_KEY = Your_Private_Key
NODE_ENV=development


# Contract Folder

PRIVATE_KEY = Your_Private_Key

```

### 4️⃣ Start the App

```bash

cd Backend
npm run dev

cd Frontend
npm run dev


```

---

## 🏗️ Architecture Overview

### System Diagram

```
Client (React + Vite)
   │
   ▼
Backend (Express + Node.js)
   │
   ├── Vehicle APIs (identity, history, diagnostics)
   ├── IPFS Storage (vehicle records)
   ├── AI Models (AI diagnostics)
   └── Massa Station (on-chain metadata)
```

### Data Flow

1. Starts with Dealer, dealer mints NFT with all the vehicle details into the buyer's wallet by uploading metadata on Massa storage
2. Service centers will upload service records by binding it with vehicle id(making hash of service record's json and then upload same on Massa Station and then hash on backend)
3. Then owners can see their vehicles and service records ledger from their dashboard.
4. They can also check resale value of their vehicles
5. Then owners can enquire about someone's vehicle just by typing its vehicle id in VahanSarthi.
---

## 🧩 Technology Stack

| Layer      | Technology         | Purpose                            |
| ---------- | ------------------ | ---------------------------------- |
| Frontend   | React + Tailwind   | UI/UX for vehicle dashboard        |
| Backend    | Node.js + Express  | REST APIs                          |
| Blockchain |  Massa Network, EVM| On-chain storage and Hosting       |
| AI         | AI Compute Network | Decentralized inference & training |
| Storage    | Massa Storage      | Vehicle records & verification     |
| DB         | MongoDB            | Off-chain cache and indexing       |

---

## ⚙️ Features

### ✅ Core (Implemented)

* Vehicle NFT minting
* Service record storage via Massa
* AI-based maintenance predictions
* Dealer & service provider registration
* Data verification via Merkle proofs
* Basic dashboard for vehicle health

### 🔮 Upcoming (Q1 2026)

* Smart NFTs (intelligent evolving NFTs)
* Predictive repair scheduling
* Vehicle resale verification
* Cross-chain interoperability
* Insurance & finance modules

---


