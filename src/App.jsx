import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PinLock from './pages/PinLock';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import BotInbox from './pages/BotInbox';
import Obligations from './pages/Obligations';
import { processAutoDeductions } from './services/db';
import './App.css';
import './services/sync'; // Initialize Firebase background sync

function App() {
  useEffect(() => {
    processAutoDeductions();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<PinLock />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bot-inbox" element={<BotInbox />} />
          <Route path="/obligations" element={<Obligations />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
