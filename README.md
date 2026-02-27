# 🍎 FruitFund – Gamified Savings for Students
> Turn your savings into a fruit-merging game.  
> Build habits. Unlock goals. Watch your money grow.
---

## 💎 Domain: Personal Finance
## 🌟 Problem Statement

### **Abstract Saving Leads to Weak Financial Discipline**

**Problem Description:**
Most young adults save money without attaching it to specific goals. Savings sit in a general account with no emotional or visual connection, making them easy to dip into for impulsive spending.

Challenges faced by young adults: <br>
**1. Abstract Saving:** Money sits unattached to goals; progress feels invisible. <br>
**2. Inconsistent Discipline:** Irregular deposits weaken long-term commitment.<br>
**3. Impulse Leakage:** Savings get spent easily due to low psychological attachment.<br>
**4. No Emotional Reinforcement:** Static numbers, no reward feedback loop.<br>
**5. Lack of Micro-Milestones:** Big goals feel overwhelming without visible stages.<br>
**6. Weak Habit Formation:** No gamification or accountability → broken streaks. <br>

**Current solutions fail because:**

- 📱 **Traditional banking apps (ex HDFC Bank, SBI) →** Focus on transactions, not behavioral motivation
- 📊 **Generic budgeting tools (ex Mint, YNAB)→** Complex dashboards overwhelm beginners
- 💳 **Savings accounts (ex Acorns, Qapital)→** Automate saving/investing but no engagement or reward loop
- 🎯 **Goal trackers (ex Walnut)→** Show static progress bars with no emotional reinforcement
- 🏦 **Fixed deposits/RDs (ex ICICI Bank FD/RD products)→** Require commitment but lack flexibility and gamified feedback
---

# 💡 Our Solution: FruitFund ("Grow Your Money. Literally.")
**Gamified savings habit app** designed for college students and young adults. <br>

Instead of boring progress bars, your savings evolve as fruits. <br>
Deposit money → fruits grow → goals level up → achievements unlock. <br>

It combines:

- 🎮 Game mechanics (fruit merging evolution)
- 💰 Financial discipline (goal-based saving)
- 🏆 Achievement tracking
- 📊 Mathematical accuracy in savings tracking

## 🚀 Live Project

**🔗 Lovable App:** https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

---
## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend                 │
│ (TypeScript + Vite) + TailwindCSS           │
│ UI • Animations • Game Logic                │
└───────────────────────┬─────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────┐
│              State Management               │
│ (React Hooks / Context)                     │
│ Savings Logic • Calculations • Goal Tracking│
└───────────────────────┬─────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────┐
│              Local Storage Layer            │
│ Persistent Goal Data • Deposit History      │
│ Achievement Vault                           │
└───────────────────────┬─────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────┐
│              Gamification Engine            │
│ Fruit Evolution • Merge Mechanics           │
│ Withdrawal Animation                        │
└─────────────────────────────────────────────┘
```
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
- **Styling:** TailwindCSS
- **State Management:** React hooks
- **Deployment:** Lovable
  
---
### 💻 How to Edit the Code
**🌐 Option 1: Use Lovable**

Visit the Lovable project:
https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

Prompt changes directly.
All updates are automatically committed to this repository.
<br><br>
**🖥️ Option 2: Use Your Preferred IDE**
Requirements <br>
- Node.js
- npm
(Install via nvm if needed: https://github.com/nvm-sh/nvm#installing-and-updating
)

**Setup**
```sh
1️⃣ Clone the repository
git clone https://github.com/himanshikhulbe-cmyk/fruit-fund-game.git

2️⃣ Enter project folder
cd fruit-fund-game

3️⃣ Install dependencies
npm install

4️⃣ Run development server
npm run dev
```
App runs locally with hot reload.
<br><br>
**🐈‍⬛ Option 3: Edit Directly in GitHub**

Open the file<br>
Click the ✏️ Edit button<br>
Commit changes
<br><br>
**☁️ Option 4: Use GitHub Codespaces**

Open repo<br>
Click Code → Codespaces<br>
Launch cloud dev environment<br>
Click "New codespaces"<br>
Commit & push changes

Start editing instantly

---
## 🧩 Project Structure

```
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
```

---
## 🎮 FruitFund Demo Flow

**1️⃣ User creates a goal + selects fruit type**
Enters:Goal name, Target amount, Deadline, Short-term / Long-term <br>
Optional: Choose Flexible / FD / RD mode <br>

**2️⃣ Makes first deposit**
✨ Fruit appears and starts evolving. <br>
Progress bar updates in real time. <br>
Streak counter activates. <br>

**3️⃣ Reaches 50% milestone**
🎉 Milestone animation plays (fruit glow + token reward). <br>
Tokens credited once (cannot be claimed again). <br>
 
**4️⃣Completes Goal**
🏆 Achievement unlocked <br>
Goal moves to Achievement Vault <br>
Leaderboard updates (if in Circle) <br>

---
## 🚧 Roadmap (Post-Hackathon)

☐ UPI auto-deposit integration <br>
☐ Referral rewards + promo code engine (Integration w/ Honey) <br>
☐ React Native mobile app <br>
☐ AI-powered financial adviser chatbot <br>
☐ Automatic AI financial tracking and feedback <br>
☐ Mini Games section <br>

---
## 👩‍💻 Team

• **Himanshi Khulbe** – UI/UX & Frontend <br>
• **Shashwati Gawali** – Design & Ppt

**College**: MKSSS’ Cummins College of Engineering for Women, Pune
---
<p align="center">  **"### We don’t just track money. We grow it — and you."** </p>
