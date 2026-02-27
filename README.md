# 🍎 FruitFund – Gamified Savings for Students
> Turn your savings into a fruit-merging game.  
> Build habits. Unlock goals. Watch your money grow.

## 🚀 Live Project

**🔗 Lovable App:** https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 📌 Overview

### **FruitFund** 
is a gamified savings habit app designed for college students and young adults.

Instead of boring progress bars, your savings evolve as fruits.
Deposit money → fruits grow → goals level up → achievements unlock.

It combines:

- 🎮 Game mechanics (fruit merging evolution)
- 💰 Financial discipline (goal-based saving)
- 🏆 Achievement tracking
- 📊 Mathematical accuracy in savings tracking

---
## 🎯 Core Features
### 🍓 Goal-Based Saving

- Create savings goals (Travel, Education, Healthcare, etc.)
- Define exact target amount
- Track real-time progress with visual fruit growth

### 🍍 Fruit Evolution System

- Small deposits → Seed stage
- Consistent savings → Fruit grows
- Goal completion → Golden Fruit 🍏✨
- Withdrawal → Fruit cracking animation 💥

### 🏆 Achievement Vault

Each completed goal shows:

- Goal name
- Target amount
- Completion date
- Total time taken
- Consistency score (%)
- Fruit evolution summary
- Badge earned

### 📱 Fully Responsive

Works perfectly on:

- Desktop (1920px+)
- Tablet (768px+)
- Mobile (375px+)

### ⚡ Performance Optimized

- <2s load time
- 60fps smooth animations
- Optimized bundle size
- No external API calls

### 🧮 Financial Integrity (Core Rule)

- All financial calculations follow:
- Exact match with user-entered target
- No rounding drift
- Dashboard stats = real saved amount
- Progress % is mathematically consistent
- Withdrawal logic updates instantly

### 🛠️ Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling: TailwindCSS
- **State Management: React hooks
- **Deployment: Lovable

---
## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│              React Frontend                 │
│ (TypeScript + Vite) + TailwindCSS           │
│ UI • Animations • Game Logic                │
└───────────────────────┬──────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────┐
│              State Management               │
│ (React Hooks / Context)                     │
│ Savings Logic • Calculations • Goal Tracking│
└───────────────────────┬──────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────┐
│              Local Storage Layer            │
│ Persistent Goal Data • Deposit History      │
│ Achievement Vault                           │
└───────────────────────┬──────────────────────┘
                        │
                        ↓
┌──────────────────────────────────────────────┐
│              Gamification Engine            │
│ Fruit Evolution • Merge Mechanics           │
│ Withdrawal Animation                        │
└──────────────────────────────────────────────┘
```
---
🧩 Project Structure
fruit-fund-game/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── App.tsx
│
├── public/
├── package.json
└── README.md
---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## ✨ Features Included
•✅ Gamified Savings Dashboard

•✅ Smart Goal Creation System (short/long term goals w/ deadlines, categories & priority tags.)

•✅ Fruit Evolution Mechanics

•✅ Milestone Token Rewards

•✅ Fruit Market with Rare Variants (golden fruits)

•✅ FriendFund (Shared Savings Goals)

•✅ Circles with Leaderboard (Compete w/ friends)

•✅ FD & RD Simulation Mode (Lock & Grow Mode)

•✅ Achievement Vault (Financial Resume)

•✅ Wishlist Integration

•✅ Motivational Smart Notifications 

•✅ Profile Analytics Dashboard



## 🎯 FruitFund Demo Flow

**1️⃣ User creates a goal + selects fruit type**

Enters:Goal name, Target amount, Deadline, Short-term / Long-term

Optional: Choose Flexible / FD / RD mode

**2️⃣ Makes first deposit**

✨ Fruit appears and starts evolving.

Progress bar updates in real time.

Streak counter activates.

**3️⃣ Reaches 50% milestone**

🎉 Milestone animation plays (fruit glow + token reward).

Tokens credited once (cannot be claimed again).
 
**4️⃣Completes Goal**

🏆 Achievement unlocked

Goal moves to Achievement Vault

Leaderboard updates (if in Circle)

## 📱 Mobile Responsive

Works perfectly on:

Desktop (1920x1080+)
Tablet (768px+)
Mobile (375px+)

Fully mobile-first design optimized for students and young savers.

## 🎨 Design Features

Fruit-inspired vibrant gradient branding (Orange / Peach / Green tones)
Milestone-based color coding:

🟢 Green → Goal On Track

🟡 Yellow → Needs Attention

🔴 Red → High Vulnerability

Smooth fruit evolution animations
Leaderboard micro-interactions
Professional loading states
Clear call-to-action buttons (Deposit, Analyze, Join Circle, Upgrade Fruit)

## ⚡ Performance

Smooth 60fps fruit evolution animations

Optimized bundle size

Efficient state management

No unnecessary external API calls (demo-safe mode available)

Instant leaderboard recalculations

## 🔗 Share Your Live Link

After deploying, share your link in your hackathon/startup submission:

Example:

Live Demo: https://fruitfund-demo.vercel.app

GitHub: https://github.com/YOUR_USERNAME/fruitfund

## 💡 Tips for Demo

Practice the full flow before presenting

Recommended demo flow:

Create a goal

Deposit → show fruit evolution

Hit 50% milestone → token reward

Show Leaderboard in Circles

Complete a goal → Achievement Vault

## 📊 What Judges Will See

Professional landing page

Gamified savings dashboard

Smooth fruit evolution animation

Interactive Savings Health Report

20 financial resilience scenarios

Real-time leaderboard

Achievement Vault (financial resume)

Personalized financial recommendations

## 🏆 Why This Demo Works

✅ Shows you can build a functional fintech prototype

✅ Proves gamified savings is technically feasible

✅ Demonstrates strong UX & behavioral design thinking

✅ Blends finance + psychology + gamification

✅ Judges can click through and experience the product

✅ Memorable visual system (evolving fruits + report score)

✅ Competitive social element (Circles + Leaderboard)
  

