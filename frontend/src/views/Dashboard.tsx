import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useGamification } from '../hooks/useGamification';
import { Activity, Flame, ActivitySquare, Target, ChevronRight, CheckCircle2, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { status } = useGamification('demo-user');
  const navigate = useNavigate();

  // Mock daily stats for demo
  const stats = [
    { label: 'Calories', current: 1450, target: 2000, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Protein', current: 65, target: 120, unit: 'g', icon: ActivitySquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Fiber', current: 18, target: 30, unit: 'g', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-8"
    >
      {/* Header section */}
      <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, <span className="text-gradient">Alex</span>
          </h1>
          <p className="text-gray-400">Here's your nutritional summary for today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/chat')}>Ask Coach</Button>
          <Button onClick={() => navigate('/scan')}>Scan Meal</Button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeIn}>
            <Card hover className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-400">Daily Goal</span>
              </div>
              
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{stat.current}</span>
                  <span className="text-xl text-gray-500">/ {stat.target} {stat.unit}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stat.current / stat.target) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                    className={`h-full ${stat.label === 'Fiber' ? 'bg-primary' : stat.label === 'Protein' ? 'bg-blue-500' : 'bg-orange-500'} rounded-full`}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Streaks & Gamification */}
        <motion.div variants={fadeIn} className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{status?.currentStreak || 0} Day Streak!</h3>
                <p className="text-sm text-primary/80">You're on fire! Keep it up.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${i < (status?.currentStreak || 0) ? 'bg-primary text-black font-bold' : 'bg-white/5 text-gray-500'}`}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              ))}
            </div>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-lg">Next Meal Ideas</h3>
            </div>
            
            <div className="space-y-4">
              {[
                "Grilled chicken salad with quinoa",
                "Mixed berry smoothie bowl with chia",
                "Greek yogurt with almonds"
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{rec}</p>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-sm gap-2" onClick={() => navigate('/chat')}>
              Ask AI for more <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        </motion.div>

        {/* Right Column: Recent Activity */}
        <motion.div variants={fadeIn} className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Recent Scans</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Avocado Toast & Eggs', type: 'Breakfast', score: 92, time: '8:45 AM', cals: 420 },
                { name: 'Grilled Salmon Bowl', type: 'Lunch', score: 88, time: '1:15 PM', cals: 550 },
                { name: 'Protein Shake', type: 'Snack', score: 75, time: '4:30 PM', cals: 210 },
              ].map((meal, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                      🥗
                    </div>
                    <div>
                      <h4 className="font-medium">{meal.name}</h4>
                      <p className="text-sm text-gray-400">{meal.type} • {meal.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block text-sm text-gray-400">
                      {meal.cals} kcal
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      meal.score >= 90 ? 'bg-primary/20 text-primary border border-primary/30' :
                      meal.score >= 80 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {meal.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-6 rounded-2xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-medium mb-1">Time for Dinner?</h4>
              <p className="text-sm text-gray-400 mb-4">Snap a photo to log your next meal</p>
              <Button size="sm" onClick={() => navigate('/scan')}>Scan Now</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
