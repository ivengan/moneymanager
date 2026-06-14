import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PinLock from './pages/PinLock';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import BotInbox from './pages/BotInbox';
import './App.css';
import './services/sync'; // Initialize Firebase background sync

function App() {
  // In a real app, we'd check IndexedDB/State for auth status
  const isAuthenticated = false; // Mock for now

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<PinLock />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bot-inbox" element={<BotInbox />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
