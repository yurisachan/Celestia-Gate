import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderPlus, Edit3, RefreshCw, XCircle, Grid3X3, Grid2X2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  targetId?: string | null;
  onClose: () => void;
  onAddLink: () => void;
  onAddFolder: () => void;
  toggleEditMode: () => void;
  isEditMode: boolean;
  onToggleFolderSize: (id: string, size: '2x2' | '3x3') => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, targetId, onClose, onAddLink, onAddFolder, toggleEditMode, isEditMode, onToggleFolderSize }) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.1 }}
        style={{ top: y, left: x }}
        className="fixed z-[100] w-56 bg-[#1e2235] border border-genshin-gold/50 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-2 border-b border-white/10 mb-1">
          <span className="text-xs text-genshin-gold/60 font-serif uppercase tracking-widest">Paimon Menu</span>
        </div>
        
        {targetId ? (
          /* Folder Context Options */
          <>
            <button 
              onClick={() => { onToggleFolderSize(targetId, '2x2'); onClose(); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
            >
              <Grid2X2 size={16} />
              <span>Switch to 4-Grid</span>
            </button>
            <button 
              onClick={() => { onToggleFolderSize(targetId, '3x3'); onClose(); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
            >
              <Grid3X3 size={16} />
              <span>Switch to 9-Grid</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
          </>
        ) : (
          /* General Context Options */
          <>
            <button 
              onClick={() => { onAddLink(); onClose(); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
            >
              <Plus size={16} />
              <span>Add Artifact (Link)</span>
            </button>

            <button 
              onClick={() => { onAddFolder(); onClose(); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
            >
              <FolderPlus size={16} />
              <span>Create Folder</span>
            </button>

            <button 
              onClick={() => { toggleEditMode(); onClose(); }}
              className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
            >
              {isEditMode ? <XCircle size={16} /> : <Edit3 size={16} />}
              <span>{isEditMode ? 'Finish Editing' : 'Edit Layout'}</span>
            </button>
          </>
        )}

        <button 
          onClick={() => { window.location.reload(); }}
          className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-genshin-gold hover:text-genshin-dark transition-colors flex items-center gap-3"
        >
          <RefreshCw size={16} />
          <span>Resonate with Statue</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;