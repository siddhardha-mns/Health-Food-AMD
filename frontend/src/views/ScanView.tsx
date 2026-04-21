import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Camera, Image as ImageIcon, Upload, Loader2, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { useNutrients } from '../hooks/useNutrients';
import { useNavigate } from 'react-router-dom';

export default function ScanView() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { analyzeImage, loading, error } = useNutrients();
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedInfo = e.target.files[0];
      setFile(selectedInfo);
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(selectedInfo);
      
      // Reset result if a new image is selected
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      const data = await analyzeImage(file);
      setResult(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Scan Your <span className="text-gradient-primary">Meal</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Our Vision AI instantly analyzes your food to calculate calories, macros, and give you a comprehensive Health Score.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Input Area */}
        <Card className="flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-white/20 hover:border-primary/50 transition-colors p-8 text-center group cursor-pointer"
              onClick={() => !imagePreview && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          
          <AnimatePresence mode="wait">
            {!imagePreview ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center pointer-events-none"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary/10 group-hover:text-primary">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Click to take a photo</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-[250px]">
                  Or drag and drop an image file here to begin analysis
                </p>
                <div className="flex gap-4">
                  <Button variant="secondary" size="sm" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center relative"
              >
                <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  
                  {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                      </div>
                      <p className="mt-4 font-medium text-white tracking-widest text-sm uppercase">Analyzing...</p>
                      
                      {/* Scanning line animation */}
                      <motion.div 
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  )}
                </div>
                
                {!result && !loading && (
                  <div className="flex gap-4 w-full">
                    <Button variant="secondary" className="flex-1" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setFile(null); }}>
                      Retake
                    </Button>
                    <Button className="flex-2 w-full" onClick={(e) => { e.stopPropagation(); handleAnalyze(); }}>
                      <Sparkles className="w-4 h-4 mr-2" /> Analyze Meal
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm w-full">
              {error}
            </div>
          )}
        </Card>

        {/* Right: Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle className="text-primary w-6 h-6" /> Result
                  </h3>
                  
                  <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full font-bold flex items-center gap-2">
                    Score: {result.healthScore.score} 
                    <span className="text-xs font-normal opacity-80 uppercase tracking-widest">({result.healthScore.grade})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Calories</p>
                    <p className="text-2xl font-bold">{Math.round(result.totalCalories)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Protein</p>
                    <p className="text-2xl font-bold text-blue-400">{Math.round(result.totalMacros.protein)}g</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Carbs</p>
                    <p className="text-2xl font-bold text-orange-400">{Math.round(result.totalMacros.carbs)}g</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Fats</p>
                    <p className="text-2xl font-bold text-yellow-400">{Math.round(result.totalMacros.fats)}g</p>
                  </div>
                </div>

                <div className="space-y-4 mb-auto">
                  <h4 className="font-semibold text-gray-300">Detected Items:</h4>
                  <ul className="space-y-2">
                    {result.foodItems.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between items-center text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                        <span className="capitalize">{item.name}</span>
                        <span className="text-gray-400">{Math.round(item.calories)} kcal</span>
                      </li>
                    ))}
                  </ul>

                  {result.healthScore.insights?.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold text-primary text-sm mb-2">NutriSense Insights</h4>
                      <p className="text-sm text-gray-300">{result.healthScore.insights[0]}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                  <Button className="flex-1" onClick={() => navigate('/')}>
                    Save & Back <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
