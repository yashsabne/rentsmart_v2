import { useState } from 'react'
import HomePage from './pages/HomePage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard';
import ListingDetails from './pages/ListingDetails';
import PropertyBuyPage from './pages/PropertyBuyPage';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import CreateListing from './pages/CreateListing';
import SavedPropertiesPage from './pages/SavedList';
import RentSmartDev from './pages/Developer';
import VerifyEmailPage from './pages/VerifyEmailPage';
import EditListing from './pages/EditListing';
import MessagesPage from './components/messages/MessagesPage';
import Help from './pages/Help';


function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route path='/login' element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/saved-properties" element={<SavedPropertiesPage />} />
        <Route path='/details/:id' element={<ListingDetails />} />
        <Route path='/search-for-property/:type' element={<PropertyBuyPage />} />
        <Route path='/create' element={<CreateListing />} />
        <Route path="/edit-property/:id" element={<EditListing />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path='/developer' element={<RentSmartDev />} />
        <Route path="/dashboard/messages" element={<Dashboard initialSection="messages" />} />
        <Route path="/dashboard/messages/:slug" element={<Dashboard initialSection="messages" />} />
        <Route path='/help' element={<Help/> } />
        
         

      </Routes>
    </Router>
  )
}

export default App
