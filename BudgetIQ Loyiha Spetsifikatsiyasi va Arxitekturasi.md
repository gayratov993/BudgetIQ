# BudgetIQ — AI Asosidagi Shaxsiy Moliyaviy Yordamchi (Texnik Spetsifikatsiya)

Ushbu hujjat **BudgetIQ** veb-ilovasini noldan yaratish uchun to‘liq texnik topshiriq (PRD), arxitektura, ma'lumotlar bazasi sxemasi va API endpointlarini o‘z ichiga oladi. OpenCode yoki boshqa AI kod yozish vositalari ushbu hujjat asosida loyiha strukturasini va kodini to‘g‘ridan-to‘g‘ri generatsiya qilishi mumkin.

---

## 1. Loyiha Haqida Umumiy Ma'lumot
* **Nomi:** BudgetIQ
* **Turi:** SaaS / FinTech B2C Web Application (Shaxsiy moliya boshqaruvi).
* **Asosiy maqsadi:** Foydalanuvchilarga o‘z daromad va xarajatlarini oson kuzatish, vizual grafiklar orqali moliyaviy holatni tahlil qilish va Sun'iy Intellekt (AI) yordamida shaxsiy moliyaviy maslahatlar hamda kelgusi oy uchun xarajatlar prognozini olish imkonini berish.

---

## 2. Texnologik Stek (Tech Stack)

Loyiha zamonaviy, tezkor va kengaytiriladigan **Fullstack** texnologiyalar asosida quriladi:

### Frontend:
* **Framework:** Next.js 15+ (App Router) yoki React 19 + Vite
* **Til:** TypeScript (qat'iy tiplashtirish uchun)
* **Styling:** Tailwind CSS + Shadcn/UI (zamonaviy va toza komponentlar uchun)
* **Grafiklar (Data Visualization):** Recharts yoki Tremor
* **State Management:** Zustand (global holat uchun) + TanStack Query (server ma'lumotlarini keshlash uchun)
* **Ikonalar:** Lucide React

### Backend & Ma'lumotlar Bazasi:
* **Backend:** Next.js API Routes (Server Actions) yoki alohida Node.js (Express / NestJS)
* **Ma'lumotlar bazasi:** PostgreSQL (Supabase yoki Neon.tech orqali bulutda)
* **ORM:** Prisma ORM
* **Autentifikatsiya:** NextAuth.js (Auth.js) yoki Clerk (Google va Email/Parol orqali kirish)

### Sun'iy Intellekt (AI) Integratsiyasi:
* **AI SDK:** Vercel AI SDK (`ai` paketi)
* **Model:** OpenAI (`gpt-4o-mini`) yoki Google Gemini (`gemini-2.5-flash`) — tezkor va arzon tahlillar uchun.

---

## 3. Funksional Imkoniyatlar (Core Features)

### 3.1. Autentifikatsiya va Foydalanuvchi Profili
* Email/parol va Google OAuth orqali ro‘yxatdan o‘tish va tizimga kirish.
* Asosiy valyutani tanlash (UZS, USD, EUR) va oylik byudjet limitini belgilash.

### 3.2. Tranzaksiyalarni Boshqarish (CRUD)
* **Qo‘shish:** Summa, turi (`INCOME` - daromad yoki `EXPENSE` - xarajat), kategoriya (Oziq-ovqat, Transport, Uy-joy, Ko'ngilochar, Maosh, Freelance va b.), sana va qisqacha izoh.
* **Tezkor AI kiritish (Smart Input):** Foydalanuvchi matn ko'rinishida *"Bugun tushlikka 45 000 so'm va taksiga 20 000 so'm ishlatdim"* deb yozsa, AI uni avtomatik ravishda 2 ta alohida tranzaksiyaga ajratib bazaga saqlaydi.
* **Tahrirlash va O‘chirish:** Mavjud yozuvlarni o‘zgartirish.
* **Filtrlash va Qidiruv:** Sana oralig‘i, kategoriya va tranzaksiya turi bo‘yicha saralash.

### 3.3. Interaktiv Dashboard (Boshqaruv Paneli)
* **KPI Kartalar:** Umumiy balans, Joriy oydagi daromad, Joriy oydagi xarajat, Byudjet limiti qoldig‘i (foizda).
* **Xarajatlar Taqsimoti (Donut/Pie Chart):** Qaysi kategoriyaga necha foiz pul ketganini ko‘rsatuvchi grafik.
* **Oylik Dinamika (Bar/Area Chart):** Oxirgi 6 oydagi daromad va xarajatlar solishtirmasi.
* **So‘nggi tranzaksiyalar ro‘yxati.**

### 3.4. AI Moliyaviy Maslahatchi (BudgetIQ Assistant)
* **Avtomatik oylik xulosa:** Foydalanuvchining oxirgi 30 kunlik ma'lumotlarini tahlil qilib, 3 ta asosiy tavsiya berish (masalan: *"O‘tgan oyga nisbatan kofe va restoranlarga 25% ko‘p pul sarfladingiz"*).
* **AI Chat:** Foydalanuvchi o‘z ma'lumotlari asosida savol bera oladi: *"Shu oyda transportga qancha ketdi?"* yoki *"Yil oxirigacha 5000$ yig‘ish uchun kunlik xarajatimni qanchaga qisqartirishim kerak?"*.

### 3.5. Byudjet Limitlari va Ogohlantirishlar
* Har bir kategoriya uchun oylik limit qo‘yish (masalan, Oziq-ovqat uchun 2 000 000 UZS).
* Limit 80% ga yetganda sariq, 100% dan oshganda qizil indikator yonishi.

### 3.6. Eksport (Hisobotlar)
* Tanlangan davr uchun tranzaksiyalarni **CSV** yoki **PDF** formatida yuklab olish.

---

## 4. Ma'lumotlar Bazasi Sxemasi (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  passwordHash  String?
  currency      String        @default("UZS")
  monthlyBudget Float         @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  transactions  Transaction[]
  categories    Category[]
  budgets       Budget[]
}

enum TransactionType {
  INCOME
  EXPENSE
}

model Category {
  id           String          @id @default(cuid())
  name         String
  icon         String          // Lucide icon nomi
  color        String          // Hex rang kodi (#FF5733)
  type         TransactionType
  userId       String?         // Null bo'lsa tizimning standart kategoriyasi
  user         User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Float
  type        TransactionType
  description String?
  date        DateTime        @default(now())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId  String
  category    Category        @relation(fields: [categoryId], references: [id])
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([userId, date])
}

model Budget {
  id         String   @id @default(cuid())
  amount     Float    // Oylik limit summasi
  month      Int      // 1-12
  year       Int      // 2026
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month, year])
}
```

---

## 5. Loyiha Papkalar Strukturasi (Folder Structure)

OpenCode loyihani quyidagi arxitektura bo‘yicha yaratishi kerak:

```text
budgetiq/
├── prisma/
│   ├── schema.prisma          # Ma'lumotlar bazasi modellari
│   └── seed.ts                # Standart kategoriyalar va demo ma'lumotlar
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login va Register sahifalari
│   │   ├── (dashboard)/       # Himoyalangan asosiy sahifalar
│   │   │   ├── dashboard/     # Asosiy grafiklar va KPIlar
│   │   │   ├── transactions/  # Barcha kirim-chiqimlar jadvali
│   │   │   ├── budgets/       # Kategoriyalar bo'yicha limitlar
│   │   │   ├── ai-advisor/    # AI tahlil va chat sahifasi
│   │   │   └── settings/      # Profil va valyuta sozlamalari
│   │   ├── api/
│   │   │   ├── transactions/  # CRUD endpointlar
│   │   │   ├── analytics/     # Grafiklar uchun agregatsiya qilingan data
│   │   │   ├── ai/
│   │   │   │   ├── parse/     # Tabiiy matndan tranzaksiya ajratish
│   │   │   │   └── chat/      # Moliyaviy AI maslahatchi stream
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Shadcn UI komponentlari
│   │   ├── charts/            # Recharts grafik komponentlari
│   │   ├── forms/             # Tranzaksiya qo'shish va Smart Input formalari
│   │   └── layout/            # Sidebar, Navbar, ThemeToggle (Dark/Light mode)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── ai.ts              # AI promptlar va konfiguratsiya
│   │   └── utils.ts           # Valyuta formatlash (masalan: 150 000 UZS)
│   └── types/                 # TypeScript interfeyslari
├── .env.example               # Kerakli muhit o'zgaruvchilari
├── package.json
└── README.md
```

---

## 6. AI Integratsiyasi Qanday Ishlaydi? (Prompt Engineering)

### 6.1. Smart Transaction Parser (`/api/ai/parse`)
* **Kiruvchi ma'lumot:** `"Kecha bozordan 120 mingga meva-cheva oldim, keyin 35 ming taksiga berdim"`
* **AI Vazifasi:** JSON formatida (Structured Outputs / `generateObject` yordamida) ma'lumotni qaytarish:
```json
{
  "transactions": [
    { "amount": 120000, "type": "EXPENSE", "category": "Oziq-ovqat", "description": "Meva-cheva" },
    { "amount": 35000, "type": "EXPENSE", "category": "Transport", "description": "Taksi" }
  ]
}
```

### 6.2. AI Financial Advisor (`/api/ai/chat`)
* Foydalanuvchi savol berganda, backend avtomatik ravishda foydalanuvchining oxirgi 3 oylik agregatsiya qilingan statistikasini (kategoriyalar bo‘yicha jami xarajatlar, o‘rtacha daromad) **System Prompt** ichiga joylaydi.
* **System Prompt namunasi:**
  > *"Sen BudgetIQ platformasining professional moliyaviy maslahatchisisan. Foydalanuvchining joriy moliyaviy holati: [JSON_STATISTIKA]. Javoblaring aniq, raqamlarga asoslangan, qisqa va amaliy bo'lsin. Foydalanuvchi qaysi tilda yozsa (O'zbek, Rus, Ingliz), shu tilda javob ber."*

---

## 7. Bosqichma-Bosqich Ishga Tushirish Rejasi (OpenCode uchun ko'rsatma)

Loyihani qurishda quyidagi ketma-ketlikka amal qilinsin:
1. **1-bosqich (Setup):** Next.js + TypeScript + Tailwind CSS + Shadcn/UI loyihasini yaratish. Dark/Light rejimini qo‘shish.
2. **2-bosqich (Database):** Prisma o‘rnatish, `schema.prisma` ni yozish va standart kategoriyalar (Oziq-ovqat, Transport, Kommunal, Maosh va h.k.) uchun `seed.ts` skriptini yozish.
3. **3-bosqich (Auth & CRUD):** Autentifikatsiyani ulash va tranzaksiyalarni qo‘shish, o‘qish, tahrirlash, o‘chirish (CRUD) API hamda UI qismini yaratish.
4. **4-bosqich (Dashboard & Charts):** Ma'lumotlarni guruhlab, Recharts orqali chiroyli grafiklar va KPI kartalarni chiqarish.
5. **5-bosqich (AI Features):** AI Smart Input (matndan tranzaksiya yaratish) va AI Financial Chat funksiyalarini integratsiya qilish.
6. **6-bosqich (Polish & Demo Mode):** Portfolioda tekshiruvchilar (HR/Team Lead) ro‘yxatdan o‘tmasdan ham bir tugma bilan loyihani sinab ko‘rishlari uchun **"Demo Akkaunt bilan kirish" (1-Click Demo Login)** tugmasini qo‘shish.