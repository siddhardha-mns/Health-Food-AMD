import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Camera, Home, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGamification } from '../../hooks/useGamification';

export function Navbar() {
  const location = useLocation();
  const { status } = useGamification('demo-user');

  const links = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Scan Meal', path: '/scan', icon: Camera },
    { name: 'Progress', path: '/gamify', icon: Trophy },
    { name: 'AI Coach', path: '/chat', icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#00993d] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.4)] group-hover:shadow-[0_0_30px_rgba(0,255,102,0.6)] transition-all">
              <Activity className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Nutri<span className="text-primary">Sense</span> AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                    isActive ? "text-primary-foreground" : "text-gray-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Stats Summary */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-white">{status?.points || 0} pts</span>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <span className="text-primary font-medium">{status?.tier || 'Starter'}</span>
            </div>
            
            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user&backgroundColor=1a1a1a`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
