# CampusBites — College Canteen Food Ordering & Delivery Platform

CampusBites is a production-ready, full-stack campus foodtech web platform built for college campuses. It mirrors the best-in-class consumer workflows of Swiggy and Zomato, but is hyper-tailored to a single university ecosystem with 4 distinct role-based portals, campus delivery zones, scheduled 15-minute slot reserving, live GPS simulation, and Gemini AI-powered dining intelligence.

---

## 🎓 Core Users & Pre-Seeded Demo Accounts

The application includes a **1-click Role Switcher** in the header so evaluators can test any persona instantly without logging in again.

| Role | Name | Email | College ID / Credentials | Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `aarav.sharma@examplecollege.edu.in` | `EC2023-CS-042` | Aryabhatta Hostel Block B, ₹450 Wallet Balance, Active Live Orders |
| **Student** | Sneha Patel | `sneha.patel@examplecollege.edu.in` | `EC2024-EC-109` | Kalpana Chawla Girls Hostel, ₹820 Wallet Balance |
| **Student** | Rohan Gupta | `rohan.gupta@examplecollege.edu.in` | `EC2023-ME-077` | Aryabhatta Block A, Scheduled Order Holder |
| **Canteen Vendor** | Chef Rajesh Kumar | `central.canteen@examplecollege.edu.in` | `STAFF-VND-001` | Manages **Aryabhatta Central Canteen** (SAC Ground Floor) |
| **Canteen Vendor** | Priya Nambiar | `greenbites@examplecollege.edu.in` | `STAFF-VND-002` | Manages **Green Bites Organic Bistro** (Sports Arena) |
| **Canteen Vendor** | Gurpreet Singh | `nightowl@examplecollege.edu.in` | `STAFF-VND-003` | Manages **Night Owl Maggi & Snacks Corner** (Hostel Gate 2) |
| **Campus Runner** | Karan Mehra | `karan.agent@examplecollege.edu.in` | `CAMPUS-RUN-01` | Vehicle: E-Scooter, Active GPS Radar, Available Tasks Feed |
| **Campus Runner** | Manpreet Sandhu | `manpreet.agent@examplecollege.edu.in` | `CAMPUS-RUN-02` | Vehicle: Bicycle |
| **College Admin** | Prof. S. Ranganathan | `admin@examplecollege.edu.in` | `ADMIN-DSW-01` | Dean of Student Welfare, Full Campus KPI Heatmap, Agent Reassignment |

---

## 🚀 Key Feature Highlights

### 1. Student Ordering Experience
- **Explore & Canteens**: Real-time open/closed status, average preparation times, minimum order checks, and food category filters.
- **Menu Customizations**: Portion sizes, recipe exclusions (e.g. "No Onion / Garlic"), spice levels (0 to 3 flames), extra toppings, and item-level kitchen notes.
- **Cart & Thresholds**: Quantity controls, free campus delivery milestone tracker (free above ₹200), and campus vouchers (`CAMPUS50`, `FRESHER20`, `FREEDEL`, `EXAMFUEL`).
- **Flexible Delivery Types**:
  - **Deliver Now**: Direct kitchen queue dispatch.
  - **Schedule Delivery**: Select date and 15-minute delivery slot within canteen operating hours.
  - **AI Smart Slot Suggestion**: Uses Gemini AI to calculate the optimal 15-minute slot based on canteen kitchen rush load and meal prep time.
- **Campus GPS Radar & Order Tracking**:
  - Live animated SVG map of college campus roads showing canteen node, student drop point, and runner moving along the path.
  - Real-time 7-stage order status stepper: `Placed` → `Accepted` → `Preparing` → `Ready for Pickup` → `Agent Assigned` → `Out for Delivery` → `Delivered`.
  - Student Delivery verification OTP (`OTP: 4819`).
  - Pre-preparation cancellation enforcement with instant campus wallet refund.
  - Printable / downloadable Cafeteria Tax Receipt / Invoice.
  - Post-delivery rating and review compliments.

### 2. Canteen / Vendor Workflow
- **Dashboard & KPIs**: Daily gross revenue, pending order approvals, active cooking line, and low-stock alerts.
- **Live Kitchen Order Manager**: Accept/Reject new orders, update preparation stages, mark ready for delivery runner pickup.
- **Operating Controls**: Opening/closing hours manager, emergency closure toggle, and Rush Hour Capacity slider (0% to 100%).
- **Menu Manager**: Add new food items, update pricing, live inventory counter (+/-), and in-stock / sold-out toggle.

### 3. Delivery Agent (Campus Runner) Flow
- **Runner Onboarding**: Name, college ID, online/offline status toggle, and vehicle type (Bicycle, E-Scooter, Walking).
- **Location Radar**: Select current campus quadrangle/location.
- **Tasks Feed**: View available drops with pickup canteen, drop hostel block, distance in meters, and payout (₹25 - ₹45).
- **Active Drop Screen**: Contact student button, campus pathway navigation guide, and proof-of-delivery 4-digit OTP verification.
- **Earnings Tracker**: Real-time daily payouts credited to runner wallet.

### 4. College Admin Console
- **Campus Analytics**: Total daily volume, campus gross revenue, average delivery time (~16 mins), and pre-prep cancellation rate.
- **Peak-Hour Heatmap**: 24-hour visualization highlighting campus lunch break and late-night study rush.
- **Orders Table**: Search and filter by canteen, status, and payment method.
- **Manual Agent Assignment**: Assign or reassign runner agents to eliminate bottlenecks.
- **Dispute Resolution & Refunds**: Review student issues with AI-drafted resolution notes and credit wallet refunds in 1 click.
- **Demo Reset Button**: One-click restore to pristine demo state.

---

## 🤖 Gemini AI Capabilities

1. **Natural-Language Food Search**: Search queries like *"something spicy under ₹100"* or *"healthy lunch without paneer"* analyze intent, budget, and dietary restrictions to return curated items with concise reasoning.
2. **AI Dining Assistant**: Curates complete balanced meals based on student budget (₹50 - ₹500), dietary preference (Veg / Non-Veg / Any), occasion, and group size with 1-click cart addition.
3. **Smart Scheduled-Delivery Slot Suggester**: Analyzes canteen operating hours, kitchen rush percentage, and prep time to recommend the freshest, least-delayed 15-minute slot.
4. **CampusBot AI Support Concierge**: Answers student FAQs about canteen timings, campus delivery rules, and delays. Automatically escalates unresolved complaints into official Admin Support Tickets.
5. **AI Review Summarizer**: Analyzes authentic student reviews into pros, cons, highlight crowd favorites, and positive sentiment scores.

---

## 💳 Payment Gateway Architecture & Production Replacement Guide

Currently, CampusBites operates in a **Clearly Labeled Sandbox / Test Gateway Mode** supporting:
1. **Mock UPI**: Generates dynamic QR code and mock UPI intent (`campusbites@okaxis`).
2. **Campus Wallet**: Direct 1-tap deduction with top-up simulation.
3. **Debit / Credit Card & Net Banking**: Sandbox transaction verification.
4. **Cash on Delivery (COD)**: Payment collected by campus runner upon OTP match.

### Upgrading to Real Gateways (Razorpay / Stripe)

To replace the sandbox gateway with **Razorpay** (Standard for INR payments in India):

1. **Install SDK**:
   ```bash
   npm install razorpay
   ```
2. **Add Environment Secrets** in `.env`:
   ```env
   RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
   RAZORPAY_KEY_SECRET="your_secret_key"
   ```
3. **In `server.ts` (`POST /api/orders`)**:
   ```ts
   import Razorpay from 'razorpay';
   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID!,
     key_secret: process.env.RAZORPAY_KEY_SECRET!,
   });

   // Create Razorpay Order
   const rzpOrder = await razorpay.orders.create({
     amount: total * 100, // in paise
     currency: 'INR',
     receipt: orderId,
   });
   ```
4. **In `CheckoutModal.tsx`**:
   Load Razorpay checkout script `https://checkout.razorpay.com/v1/checkout.js` and open standard UPI/Cards modal with `rzpOrder.id`. Upon callback, verify signature server-side and transition order status to `placed`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TSX, In-Memory & File-backed atomic database engine (`data/database.json`).
- **AI**: `@google/genai` TypeScript SDK using `gemini-3.8-flash`.
- **Styling**: Green-and-white college theme (`#059669`, `#10b981`), responsive mobile-first bottom navigation, and clean card hierarchy.
