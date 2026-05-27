import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
 
import App from './App.jsx'
import "./index.css"
import { Toaster } from "react-hot-toast";
import { SocketProvider } from './chat/socketContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketProvider>
      <Toaster position="top-right" />

    <App />
    </SocketProvider>
  </StrictMode>,
  
)

 