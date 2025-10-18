# Medinf 🚑

*MedInf* is a proof of concept project aiming to provide an interface to learn more about everyday medications using AI. 

Leveraging the openFDA API *MedInf* is able to provide **15+** different labels (from *usage warnings* to *dosage administration tables*)
as context for AI analysis *MedInf* can combinationally consider many medications at once to supply the user at speed on all relevant information
and without the hassle of reading small physical labels.

> AI Results may not be always accurate

> Medical information should be consulted with professionals 

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.