import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { useGamification } from '../hooks/useGamification';
import { Trophy, Award, Target, Flame, Star } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function GamificationView() {
  const { status, loading } = useGamification('demo-user');

  if (loading && !status) {
    return <div className="flex h-[60vh] items-center justify-center">Loading...</div>;
  }

  const badges = status?.badges || [];
  const nextMilestone = status?.nextMilestone;
  const progressPercent = nextMilestone ? Math.min(100, (status.points / nextMilestone.pointsRequired) * 100) : 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Your <span className="text-gradient">Progress</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Track your achievements, earn badges, and level up your health journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier & Points Overview */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="h-full bg-gradient-to-br from-black/60 to-[#0a1a10]">
            <div className="flex flex-col md:flex-row items-center gap-8 p-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-primary/30 flex items-center justify-center relative z-10 bg-black/40 backdrop-blur-md">
                  <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10" />
              </div>
              
              <div className="flex-1 text-center md:text-left w-full">
                <div className="mb-2">
                  <span className="text-primary font-bold tracking-widest uppercase text-sm">Current Tier</span>
                  <h2 className="text-3xl font-bold text-white">{status?.tier || 'Starter'}</h2>
                </div>
                <p className="text-gray-400 mb-6">Total Points: <span className="text-white font-bold">{status?.points || 0}</span></p>
                
                {nextMilestone && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Next: {nextMilestone.name}</span>
                      <span className="font-medium">{nextMilestone.pointsRequired} pts</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-[#00ffbb] relative"
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-[2px]" style={{ transform: 'skewX(-20deg)' }} />
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Top Streaks */}
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col justify-center items-center text-center p-8 bg-black/40">
            <Flame className="w-16 h-16 text-orange-500 mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
            <h3 className="text-2xl font-bold text-white">{status?.currentStreak || 0} Days</h3>
            <p className="text-orange-400 font-medium mb-1">Active Streak</p>
            <p className="text-gray-500 text-sm mt-4">Longest: {status?.longestStreak || 0} Days</p>
          </Card>
        </motion.div>
      </div>

      {/* Badges Collection */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-6 mt-8">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Badges Earned</h2>
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Start logging meals to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge, i) => (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center h-full relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">
                    {badge.icon || '🏅'}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-500 mt-auto">{new Date(badge.earnedAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
      
      {/* Achievements locked */}
      <motion.div variants={itemVariants} className="pt-8">
        <h3 className="text-lg font-medium text-gray-400 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-gray-500" /> Discover More Badges
        </h3>
        <div className="opacity-50 grayscale grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Mock locked badges for visual effect */}
           <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
             <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/10 text-2xl">👑</div>
             <div>
                <p className="text-sm font-medium">Dietitian</p>
                <p className="text-xs text-gray-500">Log 100 perfect meals</p>
             </div>
           </div>
           <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
             <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-white/10 text-2xl">🌟</div>
             <div>
                <p className="text-sm font-medium">Master</p>
                <p className="text-xs text-gray-500">Reach 10k points</p>
             </div>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
