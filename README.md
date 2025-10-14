# Photobooth — Simple Photobooth App

A lightweight demo photobooth application built with Next.js 15.  
This project is created for UNSIQ DiscoverIT Teknik Informatika 2025 to demonstrate web development concepts and the interaction between frontend and backend.

## Key points

- Purpose: Teaching demo to explain frontend / backend responsibilities.
- Framework: Next.js 15 (React + server capabilities).
- Scope: Simple camera capture, preview, retake, and save/upload flow.

## Features

- Live camera capture (web browser).
- Instant preview and retake functionality.
- Simple upload endpoint to persist images using supabase as database.
- Minimal UI focused on demonstrating request flow between client and server.

## Tech stack

- Next.js 15 (App Router + API routes)
- React (frontend camera UI)
- Node.js for server-side handlers
- Supabase to store images

## Getting started

Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

Installation

1. Clone the repo:
   git clone <repository-url>
2. Install dependencies:
   npm install
   (or yarn)
3. Run development server:
   npm run dev
   Open http://localhost:3000

Build & Start

- Build: npm run build
- Start: npm run start

## How it demonstrates frontend vs backend

- Frontend (browser):
  - Accesses user camera via getUserMedia.
  - Handles UI for capture, preview, and retake.
  - Submits image data (base64 or FormData) to backend upload endpoints.
- Backend (Next.js API routes / server handlers):
  - Receives image data.
  - Validates and stores images (file system, DB, or cloud).
  - Returns metadata/URLs for frontend to display or persist.

## Attribution

Demo application for UNSIQ DiscoverIT Teknik Informatika 2025. Use and adapt for educational purposes.
