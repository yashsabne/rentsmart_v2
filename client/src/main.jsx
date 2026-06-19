import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
 
import App from './App.jsx'
import "./index.css"
import { Toaster } from "react-hot-toast";
import { SocketProvider } from './chat/socketContext.jsx';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider>
      <Toaster position="top-right" />

    <App />
        <Analytics />
        <SpeedInsights/>
    </SocketProvider>
  </StrictMode>,
  
)

 