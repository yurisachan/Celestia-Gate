import React, { useRef } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { Category, LinkItem } from '../types';
import DesktopIcon from './DesktopIcon';
import { GRID_GAP_CLASS, GRID_ITEM_CLASS } from '../constants';

interface FolderWindowProps {
  category: Category;
  onClose: () => void;
  onLinkClick: (url: string) => void;
  onUpdateFolderLinks: (newLinks: LinkItem[]) => void;
  onMoveToDesktop: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

const FolderWindow: React.FC<FolderWindowProps> = ({ 
    category, onClose, onLinkClick, onUpdateFolderLinks, onMoveToDesktop, onDeleteLink, isEditMode, onToggleEditMode 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag & Swap Logic Refs
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredSlotRef = useRef<number | null>(null);
  const dragSourceRef = useRef<number | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate Layout Stats
  const folderSize = category.folderSize || '3x3';
  const maxSlots = folderSize === '2x2' ? 4 : 9;
  
  // Create a display array that is exactly maxSlots long
  const displayItems = Array.from({ length: maxSlots }, (_, i) => category.links[i] || null);

  const handleDragStart = (index: number) => {
    dragSourceRef.current = index;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const point = info.point;
    const elements = document.elementsFromPoint(point.x, point.y);
    const slotElement = elements.find(el => el.hasAttribute('data-folder-slot-index'));

    if (slotElement) {
        const targetIndex = parseInt(slotElement.getAttribute('data-folder-slot-index') || '-1', 10);
        
        if (targetIndex !== -1 && targetIndex !== dragSourceRef.current) {
             const effectiveTarget = Math.min(targetIndex, category.links.length - 1);
             
             if (hoveredSlotRef.current !== effectiveTarget) {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                hoveredSlotRef.current = effectiveTarget;
                hoverTimeoutRef.current = setTimeout(() => {
                    performSwap(dragSourceRef.current!, effectiveTarget);
                }, 800); 
            }
        }
    } else {
         if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
         hoveredSlotRef.current = null;
    }
  };

  const handleDragEnd = (index: number, info: PanInfo) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoveredSlotRef.current = null;
    
    // Check for "Move to Desktop" (Drag outside)
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const { x, y } = info.point;
        const buffer = 50; 
        if (
          x < rect.left - buffer || 
          x > rect.right + buffer || 
          y < rect.top - buffer || 
          y > rect.bottom + buffer
        ) {
          const link = category.links[index];
          if (link) {
              onMoveToDesktop(link.id);
              dragSourceRef.current = null;
              return;
          }
        }
    }

    // Snap / Swap Logic
    const dropPoint = info.point;
    let closestIndex = -1;
    let minDistance = Infinity;

    slotRefs.current.forEach((ref, i) => {
        if (ref) {
            const rect = ref.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(dropPoint.x - centerX, 2) + Math.pow(dropPoint.y - centerY, 2));

            if (dist < 100 && dist < minDistance) {
                minDistance = dist;
                closestIndex = i;
            }
        }
    });

    if (closestIndex !== -1 && closestIndex !== dragSourceRef.current && dragSourceRef.current !== null) {
        const effectiveTarget = Math.min(closestIndex, category.links.length - 1);
        performSwap(dragSourceRef.current, effectiveTarget);
    }
    
    dragSourceRef.current = null;
  };

  const performSwap = (sourceIdx: number, targetIdx: number) => {
      if (sourceIdx < 0 || sourceIdx >= category.links.length) return;
      if (targetIdx < 0 || targetIdx >= category.links.length) return;

      const newLinks = [...category.links];
      const temp = newLinks[sourceIdx];
      newLinks[sourceIdx] = newLinks[targetIdx];
      newLinks[targetIdx] = temp;
      
      onUpdateFolderLinks(newLinks);
      dragSourceRef.current = targetIdx;
      
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoveredSlotRef.current = null;
  };

  const gridWidthClass = folderSize === '2x2' 
    ? 'w-[216px] md:w-[256px]' 
    : 'w-[332px] md:w-[392px]';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative bg-[#1e2235]/90 border border-white/10 rounded-[2rem] shadow-2xl p-8 mx-4 flex flex-col items-center z-[70]`}
      >
        <h2 className="text-3xl font-serif text-white mb-8 drop-shadow-md cursor-default">
            {category.title}
        </h2>

        {/* Grid Container */}
        <div className={`relative ${gridWidthClass}`} style={{ minHeight: '280px' }}>
          
          <div className={`flex flex-wrap justify-center content-start ${GRID_GAP_CLASS} w-full relative z-10`}>
            {displayItems.map((link, index) => (
                <div 
                    key={link ? link.id : `empty-${index}`}
                    ref={(el) => { slotRefs.current[index] = el; }}
                    data-folder-slot-index={index}
                    /* Ensure empty slots maintain exact dimensions but are invisible */
                    className={`${GRID_ITEM_CLASS} flex flex-col items-center justify-start p-2 relative rounded-xl transition-colors duration-300`}
                >
                    <AnimatePresence>
                        {link ? (
                            <DesktopIcon 
                                item={link}
                                onClick={() => onLinkClick(link.url)}
                                onDelete={() => onDeleteLink(link.id)}
                                isEditMode={isEditMode}
                                onLongPress={onToggleEditMode}
                                onDragStart={() => handleDragStart(index)}
                                onDrag={handleDragMove}
                                onDragEnd={(_, info) => handleDragEnd(index, info)}
                            />
                        ) : (
                            /* Invisible placeholder that maintains spacing */
                            <div className="w-full h-full pointer-events-none" />
                        )}
                    </AnimatePresence>
                </div>
            ))}
          </div>
          
          {category.links.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-gray-400 text-sm italic">Empty Folder</div>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default FolderWindow;