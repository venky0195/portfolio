# Venkatesh G — Portfolio

This is a modern, fully customizable developer portfolio built with **Next.js App Router**, **Tailwind CSS**, and **Framer Motion**. All content is dynamically loaded from a single `content.json` file.

## ✨ Features

- 💡 JSON-based content — change everything without touching the code
- 🌗 Light/Dark mode with theme toggle
- 💻 Fully responsive, clean layout
- 🎞️ Smooth animations using Framer Motion
- 🚀 Built with performance-first mindset (Turbopack enabled)
- 🧩 Modular component architecture

---

## 📁 Project Structure

```text
/app
  /components       → Reusable UI components
  /layout.tsx       → Root layout with dynamic metadata
  /page.tsx         → Conditionally renders sections based on content.json

/public
  /images           → All portfolio-related images (used in JSON)
  content.json      → Single source of truth for all content

/types.ts           → Shared TypeScript interfaces
```

---

## 🛠️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm dev
```

---

## 🧠 How It Works

- All content is defined in `public/content.json`.
- Each section (Hero, About, Projects, Websites, Contact, Footer) is rendered **only if present** in `content.json`.
- Metadata like title and description is also dynamically generated from this file.

> Example:

```json
{
  "metadata": {
    "title": "Venkatesh | Portfolio",
    "description": "Software Engineer Portfolio"
  },
  "header": {
    "logo": "VG",
    "nav": [
      { "label": "Home", "href": "#hero" },
      { "label": "Projects", "href": "#projects" }
    ]
  },
  ...
}
```

---

## 🖼️ Images

All images referenced in the JSON must be placed inside the `/public` directory. For example:


```json
{
  "imageUrl": "/images/project-1.png"
}
```

---

## 🔧 Customization

To customize:

1. Edit `public/content.json` with your own data
2. Replace the images in `/public/images`
3. (Optional) Adjust styles in `globals.css` or Tailwind classes

---

## 📦 Built With

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📄 License

MIT — [Venkatesh G](https://github.com/https://github.com/venky0195).
