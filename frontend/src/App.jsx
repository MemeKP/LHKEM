import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Users from './pages/Users';
import Map from './pages/Map';
import Workshops from './pages/Workshops';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="map" element={<Map />} />
            <Route path="workshops" element={<Workshops />} />
          </Route>
          
          {/* Auth Routes - Without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
