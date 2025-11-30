# Nexgen Stocks Frontend — React.js, Axios, React Router

This is the frontend UI for **Nexgen Stocks**, an AI-powered stock market platform.  
The frontend provides stock dashboards, portfolio interface, buy/sell modal, authentication pages, and an AI chatbot interface.

## Overview:
The frontend communicates with the backend REST API using Axios.  
It includes a responsive UI, protected routes, sidebar navigation, and animated components using Framer Motion.  
Users can log in, browse stocks, manage their portfolio, and interact with the AI chatbot.

## Features:
### Authentication  
- Login and signup pages  
- JWT token stored securely in localStorage  
- Protected routes  
- Auto redirect on auth state change  

### Stock Dashboard  
- Fetch and display live stock data  
- Trending stocks  
- Individual stock details  
- Buy/Sell modal popup for trades  

### Portfolio System  
- Shows the user’s total investments  
- Holdings and profit/loss tracking  
- View transaction history  
- Integrated Buy/Sell functionality  

### AI Chatbot  
- Chat-based interface  
- Sends queries to backend → Gemini API  
- Replies shown in a chat-style UI  

### UI/UX  
- Sidebar navigation  
- Smooth animations (Framer Motion)  
- Responsive layout  
- Clean and modern interface  

## Tech Stack:
- React.js  
- React Router  
- Axios  
- Framer Motion  
- Vite  
- CSS / Tailwind (optional)

## Folder Structure:
