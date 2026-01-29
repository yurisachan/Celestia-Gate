import React, { useState } from 'react';
import { Search, Globe, Flame, LayoutGrid, Disc } from 'lucide-react';
import { SearchEngine } from '../types';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<SearchEngine>('google');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let url = '';
    switch (engine) {
      case 'google': url = `https://www.google.com/search?q=${encodeURIComponent(query)}`; break;
      case 'bing': url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`; break;
      case 'duckduckgo': url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`; break;
      case 'yandex': url = `https://yandex.com/search/?text=${encodeURIComponent(query)}`; break;
    }
    window.location.href = url;
  };

  const toggleEngine = () => {
    const engines: SearchEngine[] = ['google', 'bing', 'yandex', 'duckduckgo'];
    const currentIndex = engines.indexOf(engine);
    setEngine(engines[(currentIndex + 1) % engines.length]);
  };

  const getEngineIcon = () => {
    switch (engine) {
      case 'google': return <Globe size={20} className="text-blue-400" />;
      case 'bing': return <LayoutGrid size={20} className="text-cyan-400" />; // Abstract representation for Bing
      case 'yandex': return <Disc size={20} className="text-red-500" />;
      case 'duckduckgo': return <Flame size={20} className="text-orange-500" />;
      default: return <Search size={20} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative z-30">
      <form onSubmit={handleSearch} className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
        <div className={`absolute -inset-1 bg-gradient-to-r from-genshin-gold via-purple-400 to-genshin-gold rounded-full opacity-50 blur transition duration-500 ${isFocused ? 'opacity-100' : 'opacity-30'}`}></div>
        
        <div className="relative flex items-center bg-genshin-dark/80 backdrop-blur-md border border-genshin-gold/30 rounded-full shadow-2xl overflow-hidden">
          
          {/* Engine Selector */}
          <button 
            type="button"
            onClick={toggleEngine}
            className="pl-4 pr-3 py-4 hover:bg-white/5 transition-colors border-r border-genshin-gold/20 flex items-center gap-2 tooltip-trigger"
            title={`Current: ${engine.charAt(0).toUpperCase() + engine.slice(1)}`}
          >
             {getEngineIcon()}
          </button>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Search Teyvat via ${engine.charAt(0).toUpperCase() + engine.slice(1)}...`}
            className="w-full bg-transparent text-white px-4 py-4 focus:outline-none font-sans text-lg placeholder-gray-400"
          />

          <button type="submit" className="pr-6 pl-3 text-genshin-gold hover:text-white transition-transform hover:scale-110">
            <Search size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;