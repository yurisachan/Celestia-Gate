import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [date, setDate] = useState(new Date());
  
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => null);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const changeMonth = (offset: number) => {
    setDate(new Date(date.getFullYear(), date.getMonth() + offset, 1));
  };

  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  return (
    <>
      {/* Backdrop for click-outside */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="absolute top-full mt-4 bg-genshin-dark/95 backdrop-blur-xl border-2 border-genshin-gold rounded-xl p-6 w-80 shadow-2xl text-genshin-goldLight z-[70]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-genshin-gold/30 pb-2">
          <button onClick={() => changeMonth(-1)} className="hover:text-white"><ChevronLeft size={20} /></button>
          <span className="font-serif font-bold text-lg">{monthNames[date.getMonth()]} {date.getFullYear()}</span>
          <button onClick={() => changeMonth(1)} className="hover:text-white"><ChevronRight size={20} /></button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center font-sans text-sm mb-2 opacity-70">
          {weekDays.map(d => <div key={d}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center font-sans">
          {padding.map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(d => (
            <div 
              key={d} 
              className={`p-2 rounded-full text-sm cursor-default transition-all
                ${isToday(d) ? 'bg-genshin-gold text-genshin-dark font-bold shadow-[0_0_10px_#d4c498]' : 'hover:bg-white/10'}
              `}
            >
              {d}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-genshin-goldLight drop-shadow-lg mb-8 relative z-50">
      <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-genshin-goldLight to-genshin-gold tabular-nums">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </h1>
      
      <div className="relative">
        <button 
          onClick={() => setShowCalendar(!showCalendar)}
          className="text-lg md:text-xl font-sans opacity-80 mt-2 tracking-widest uppercase hover:text-white hover:opacity-100 transition-all cursor-pointer bg-white/5 px-4 py-1 rounded-full border border-transparent hover:border-genshin-gold/30"
        >
          {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </button>

        <AnimatePresence>
          {showCalendar && (
            <CalendarModal onClose={() => setShowCalendar(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Clock;