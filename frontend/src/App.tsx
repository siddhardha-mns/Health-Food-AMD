import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar';
import Dashboard from './views/Dashboard';
import ScanView from './views/ScanView';
import GamificationView from './views/GamificationView';
import ChatTerminal from './views/ChatTerminal';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
        {/* Ambient background effect */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <Navbar />
        
        <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scan" element={<ScanView />} />
              <Route path="/gamify" element={<GamificationView />} />
              <Route path="/chat" element={<ChatTerminal />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
