# 🧠 AI Model Hub

A full-stack, production-ready AI platform inspired by Hugging Face that allows users to discover, test, and share cutting-edge AI models.

---

## 🚀 Features

- **Models Directory**: An expansive library of AI models across various categories (Text generation, Image generation, Summarization, and more).
- **Interactive Playground**: Test models in real-time using a conversational interface. Fully supports streamed responses via the **Hugging Face Inference API**.
- **Model Uploads**: Easily share your own AI models with the community.
- **Secure Authentication**: Built-in user authentication (Login/Signup) powered by **Supabase**.
- **Usage & Generation History**: Track your previous generations and model interactions seamlessly.
- **Premium Pricing Tiers**: Manage user credits and subscriptions with integrated pricing tiers.
- **Beautiful & Accessible UI**: A highly responsive, animated, and modern user interface styled with **Tailwind CSS**, **Framer Motion**, and **shadcn/ui**.

---

## 🛠️ Tech Stack

**Frontend Architecture**:
- **Framework**: React 18 + Vite + TypeScript
- **Routing**: React Router DOM v6
- **Data Fetching/Caching**: TanStack Query (React Query)
- **UI & Styling**: Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form + Zod

**Backend & BaaS**:
- **Database & Authentication**: Supabase
- **AI Integration**: Hugging Face Inference API (e.g., streaming `meta-llama/Meta-Llama-3-8B-Instruct`)

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and npm installed.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of your project and add your necessary API keys (like Hugging Face and Supabase keys):
```env
VITE_HUGGINGFACE_TOKEN="your_hugging_face_token_here"
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Start Development Server
Run the local development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

- `/src/pages`: Contains all major page views (`/` Home, `/models`, `/playground`, `/upload`, `/history`, `/pricing` etc.)
- `/src/components`: Reusable UI components including global `Navbar` and complex layout fragments.
- `/src/lib`: Core utilities such as `ai-client.ts` to manage streaming connections to Hugging Face models.
- `/src/contexts`: Global application contexts like `AuthContext.tsx`.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
