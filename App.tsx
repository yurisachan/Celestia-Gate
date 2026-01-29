import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import Background from './components/Background';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import Dock from './components/Dock';
import ContextMenu from './components/ContextMenu';
import DesktopIcon from './components/DesktopIcon';
import FolderWindow from './components/FolderWindow';
import { DEFAULT_ITEMS_LIST, GRID_GAP_CLASS, GRID_TOTAL_SLOTS, INITIAL_SLOT_INDICES, GRID_ITEM_CLASS } from './constants';
import { Category, LinkItem } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);
type DesktopItem = Category | LinkItem;

// Grid State is an array of 24 items (null or DesktopItem)
type GridState = (DesktopItem | null)[];

// Delete Request Type
type DeleteRequest = {
  type: 'grid_item' | 'folder_item';
  itemId: string;
  itemName?: string; // For display in modal
  folderId?: string; // only for folder_item
} | null;

const App: React.FC = () => {
  const [gridItems, setGridItems] = useState<GridState>(Array(GRID_TOTAL_SLOTS).fill(null));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'link' | 'folder'>('link');
  const [isEditMode, setIsEditMode] = useState(false);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; targetId?: string | null }>({ visible: false, x: 0, y: 0 });
  const [inputTitle, setInputTitle] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [newFolderSize, setNewFolderSize] = useState<'2x2' | '3x3'>('3x3');
  
  // State for Delete Confirmation Modal
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);

  // Drag & Swap Logic Refs
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredSlotRef = useRef<number | null>(null);
  const dragSourceRef = useRef<number | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize Grid
  useEffect(() => {
    const savedGrid = localStorage.getItem('genshin-nav-grid');
    if (savedGrid) {
        setGridItems(JSON.parse(savedGrid));
    } else {
        const initialGrid = Array(GRID_TOTAL_SLOTS).fill(null);
        // Place default items in slots 3, 4, 5 (Indices 2, 3, 4)
        DEFAULT_ITEMS_LIST.forEach((item, i) => {
            const slotIndex = INITIAL_SLOT_INDICES[i];
            if (slotIndex !== undefined && slotIndex < GRID_TOTAL_SLOTS) {
                initialGrid[slotIndex] = item;
            }
        });
        setGridItems(initialGrid);
    }
  }, []);

  useEffect(() => {
    if (gridItems.some(item => item !== null)) {
        localStorage.setItem('genshin-nav-grid', JSON.stringify(gridItems));
    }
  }, [gridItems]);

  const handleContextMenu = (e: React.MouseEvent, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, targetId });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('.group') && isEditMode) {
          // Keep edit mode active if clicking inside a folder
          if (!target.closest('[class*="folder-"]')) {
             setIsEditMode(false);
          }
      }
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false, targetId: null });
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu, isEditMode]);

  const openModal = (type: 'link' | 'folder') => {
      setModalType(type);
      setInputTitle('');
      setInputUrl('');
      setNewFolderSize('3x3'); // Reset default size
      setIsModalOpen(true);
  };

  const addItemToGrid = (item: DesktopItem) => {
    // Find first empty slot
    const emptyIndex = gridItems.findIndex(i => i === null);
    if (emptyIndex !== -1) {
        const newGrid = [...gridItems];
        newGrid[emptyIndex] = item;
        setGridItems(newGrid);
    } else {
        alert("Grid is full!");
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle) return;

    let newItem: DesktopItem;
    if (modalType === 'folder') {
        newItem = {
            id: generateId(),
            title: inputTitle,
            folderSize: newFolderSize, // Use selected size
            links: []
        };
    } else {
        if (!inputUrl) return;
        let finalUrl = inputUrl;
        if (!finalUrl.match(/^https?:\/\//i)) finalUrl = 'https://' + finalUrl;
        
        let domain = '';
        try { domain = new URL(finalUrl).hostname; } catch (e) { domain = ''; }
        
        const faviconUrl = domain 
            ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
            : undefined;

        newItem = {
            id: generateId(),
            title: inputTitle,
            url: finalUrl,
            iconName: 'Compass', 
            iconUrl: faviconUrl,
            isCustom: true
        };
    }
    addItemToGrid(newItem);
    setIsModalOpen(false);
  };

  // --- Deletion Logic ---

  const requestDeleteItem = (id: string) => {
      const item = gridItems.find(i => i && i.id === id);
      setDeleteRequest({ 
          type: 'grid_item', 
          itemId: id,
          itemName: item ? item.title : 'Item'
      });
  };
  
  const requestDeleteLinkFromFolder = (linkId: string) => {
      if (!openFolderId) return;
      const folder = getActiveFolder();
      const link = folder?.links.find(l => l.id === linkId);
      
      setDeleteRequest({ 
          type: 'folder_item', 
          itemId: linkId, 
          folderId: openFolderId,
          itemName: link ? link.title : 'Link'
      });
  }

  const confirmDelete = () => {
      if (!deleteRequest) return;

      if (deleteRequest.type === 'grid_item') {
          setGridItems(prev => prev.map(item => (item && item.id === deleteRequest.itemId ? null : item)));
          // If we deleted a folder that was open, close it
          if (openFolderId === deleteRequest.itemId) {
              setOpenFolderId(null);
          }
      } else if (deleteRequest.type === 'folder_item' && deleteRequest.folderId) {
          const folder = gridItems.find(i => i && i.id === deleteRequest.folderId) as Category;
          if (folder) {
              const newLinks = folder.links.filter(l => l.id !== deleteRequest.itemId);
              updateFolderLinks(deleteRequest.folderId, newLinks);
          }
      }

      setDeleteRequest(null);
  };

  // --- End Deletion Logic ---

  const toggleFolderSize = (id: string, size: '2x2' | '3x3') => {
      setGridItems(prev => prev.map(item => {
          if (item && 'links' in item && item.id === id) return { ...item, folderSize: size };
          return item;
      }));
  };

  const getActiveFolder = () => {
      if (!openFolderId) return null;
      return gridItems.find(item => item && item.id === openFolderId) as Category;
  };

  const updateFolderLinks = (folderId: string, newLinks: LinkItem[]) => {
      setGridItems(prev => prev.map(item => {
          if (item && item.id === folderId && 'links' in item) return { ...item, links: newLinks };
          return item;
      }));
  };

  const moveLinkToDesktop = (folderId: string, linkId: string) => {
      const folderItem = gridItems.find(item => item && item.id === folderId);
      if (!folderItem || !('links' in folderItem)) return;

      const linkToMove = folderItem.links.find(l => l.id === linkId);
      if (!linkToMove) return;

      const updatedFolder = {
          ...folderItem,
          links: folderItem.links.filter(l => l.id !== linkId)
      };

      const emptyIndex = gridItems.findIndex(i => i === null);
      if (emptyIndex === -1) {
          alert("Desktop is full!");
          return;
      }

      const newGrid = [...gridItems];
      const folderIndex = newGrid.findIndex(i => i && i.id === folderId);
      if (folderIndex !== -1) newGrid[folderIndex] = updatedFolder;
      newGrid[emptyIndex] = linkToMove;
      
      setGridItems(newGrid);
      setOpenFolderId(null);
  };

  // ----- GRID DRAG & SWAP LOGIC -----

  const handleDragStart = (index: number) => {
    dragSourceRef.current = index;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // We keep the "Long Hover" logic as an alternative way to swap
    const point = info.point;
    const elements = document.elementsFromPoint(point.x, point.y);
    const slotElement = elements.find(el => el.hasAttribute('data-slot-index'));

    if (slotElement) {
        const targetIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1', 10);
        
        if (targetIndex !== -1 && targetIndex !== dragSourceRef.current) {
            if (hoveredSlotRef.current !== targetIndex) {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                hoveredSlotRef.current = targetIndex;
                
                // Only trigger swap hover if we are NOT holding a link over a folder
                // (We want to wait for drop to merge, not swap automatically)
                const sourceItem = gridItems[dragSourceRef.current!];
                const targetItem = gridItems[targetIndex];
                
                const isMergeTarget = sourceItem && !('links' in sourceItem) && targetItem && ('links' in targetItem);
                
                if (!isMergeTarget) {
                    hoverTimeoutRef.current = setTimeout(() => {
                        performSwap(dragSourceRef.current!, targetIndex);
                    }, 800); 
                }
            }
        } else {
             if (hoverTimeoutRef.current) {
                 clearTimeout(hoverTimeoutRef.current);
                 hoverTimeoutRef.current = null;
                 hoveredSlotRef.current = null;
             }
        }
    } else {
         if (hoverTimeoutRef.current) {
             clearTimeout(hoverTimeoutRef.current);
             hoverTimeoutRef.current = null;
             hoveredSlotRef.current = null;
         }
    }
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
    hoveredSlotRef.current = null;
    
    // SNAP LOGIC: Find nearest slot on release
    const dropPoint = info.point;
    let closestIndex = -1;
    let minDistance = Infinity;

    slotRefs.current.forEach((ref, index) => {
        if (ref) {
            const rect = ref.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const dist = Math.sqrt(
                Math.pow(dropPoint.x - centerX, 2) + 
                Math.pow(dropPoint.y - centerY, 2)
            );

            if (dist < 100 && dist < minDistance) {
                minDistance = dist;
                closestIndex = index;
            }
        }
    });

    if (closestIndex !== -1 && closestIndex !== dragSourceRef.current && dragSourceRef.current !== null) {
        // CHECK FOR MERGE: Link -> Folder
        const sourceItem = gridItems[dragSourceRef.current];
        const targetItem = gridItems[closestIndex];
        
        if (sourceItem && !('links' in sourceItem) && targetItem && 'links' in targetItem) {
            // MERGE Logic
            const updatedFolder = {
                ...targetItem,
                links: [...targetItem.links, sourceItem as LinkItem]
            };
            
            setGridItems(prev => {
                const newGrid = [...prev];
                newGrid[closestIndex] = updatedFolder;
                newGrid[dragSourceRef.current!] = null; // Remove source
                return newGrid;
            });
        } else {
            // SWAP Logic (Default)
            performSwap(dragSourceRef.current, closestIndex);
        }
    }
    
    dragSourceRef.current = null;
  };

  const performSwap = (sourceIdx: number, targetIdx: number) => {
    setGridItems(prev => {
        const newGrid = [...prev];
        const temp = newGrid[sourceIdx];
        newGrid[sourceIdx] = newGrid[targetIdx];
        newGrid[targetIdx] = temp;
        return newGrid;
    });
    dragSourceRef.current = targetIdx;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoveredSlotRef.current = null;
  };


  return (
    <div 
        className="h-full w-full text-gray-100 font-sans selection:bg-genshin-gold selection:text-genshin-dark relative flex flex-col overflow-hidden"
        onContextMenu={(e) => handleContextMenu(e)}
    >
      <Background />

      <ContextMenu 
        x={contextMenu.x} 
        y={contextMenu.y} 
        visible={contextMenu.visible} 
        targetId={contextMenu.targetId}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        onAddLink={() => openModal('link')}
        onAddFolder={() => openModal('folder')}
        toggleEditMode={() => setIsEditMode(!isEditMode)}
        isEditMode={isEditMode}
        onToggleFolderSize={toggleFolderSize}
      />

      <main className="flex-1 flex flex-col items-center w-full relative z-10 overflow-hidden">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center mt-8 md:mt-12 mb-4 flex-shrink-0"
        >
          <Clock />
          <SearchBar />
        </motion.div>

        {/* Desktop Container */}
        <div className="w-full max-w-[1200px] flex-1 overflow-y-auto px-4 pb-32 relative no-scrollbar flex justify-center">
            
            <div className={`flex flex-wrap justify-center content-start ${GRID_GAP_CLASS} w-full`}>
                {gridItems.map((item, index) => (
                    <div 
                        key={index}
                        ref={(el) => { slotRefs.current[index] = el; }}
                        data-slot-index={index}
                        className={`${GRID_ITEM_CLASS} flex flex-col items-center justify-start p-2 relative rounded-xl transition-colors duration-300 ${isEditMode ? 'bg-white/5 border border-white/5 hover:bg-white/10' : ''}`}
                    >
                        <AnimatePresence>
                            {item && (
                                <DesktopIcon 
                                    key={item.id}
                                    layoutId={item.id}
                                    item={item}
                                    onClick={() => {
                                        if ('links' in item) {
                                            setOpenFolderId(item.id);
                                        }
                                        else if (!isEditMode) {
                                            window.open(item.url, '_blank');
                                        }
                                    }}
                                    onDelete={() => requestDeleteItem(item.id)}
                                    onContextMenu={(e) => {
                                        if ('links' in item) handleContextMenu(e, item.id);
                                        else handleContextMenu(e); 
                                    }}
                                    onLongPress={() => setIsEditMode(true)}
                                    isEditMode={isEditMode}
                                    // Drag Props
                                    onDragStart={() => handleDragStart(index)}
                                    onDrag={handleDragMove}
                                    onDragEnd={handleDragEnd}
                                />
                            )}
                        </AnimatePresence>
                        
                        {/* Empty Slot Visual Indicator in Edit Mode */}
                        {!item && isEditMode && (
                             <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                <div className="w-2 h-2 bg-white rounded-full" />
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </main>

      <AnimatePresence>
        {openFolderId && getActiveFolder() && (
            <FolderWindow 
                category={getActiveFolder()!}
                onClose={() => setOpenFolderId(null)}
                onLinkClick={(url) => {
                    if (!isEditMode) window.open(url, '_blank');
                }}
                onUpdateFolderLinks={(newLinks) => updateFolderLinks(openFolderId, newLinks)}
                onMoveToDesktop={(linkId) => moveLinkToDesktop(openFolderId, linkId)}
                onDeleteLink={requestDeleteLinkFromFolder}
                isEditMode={isEditMode}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
            />
        )}
      </AnimatePresence>

      <Dock onLinkClick={(url) => window.open(url, '_blank')} />

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1e2235] w-full max-w-md rounded-xl border-2 border-genshin-gold p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-serif text-genshin-gold mb-6 text-center">
                {modalType === 'folder' ? 'Create New Folder' : 'Add New Artifact'}
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-serif text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    className="w-full bg-black/30 border border-genshin-gold/30 rounded px-4 py-2 text-white focus:border-genshin-gold focus:outline-none transition-colors"
                    placeholder="Title"
                  />
                </div>
                
                {/* Folder Size Selection */}
                {modalType === 'folder' && (
                    <div>
                        <label className="block text-sm font-serif text-gray-400 mb-2">Grid Size</label>
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setNewFolderSize('2x2')}
                                className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${newFolderSize === '2x2' ? 'border-genshin-gold bg-genshin-gold/20 text-genshin-gold shadow-[0_0_10px_rgba(212,196,152,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="text-center font-bold font-serif mb-1">Compact</div>
                                <div className="text-xs opacity-70">2x2 (4 items)</div>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewFolderSize('3x3')}
                                className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${newFolderSize === '3x3' ? 'border-genshin-gold bg-genshin-gold/20 text-genshin-gold shadow-[0_0_10px_rgba(212,196,152,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="text-center font-bold font-serif mb-1">Standard</div>
                                <div className="text-xs opacity-70">3x3 (9 items)</div>
                            </button>
                        </div>
                    </div>
                )}

                {modalType === 'link' && (
                <div>
                  <label className="block text-sm font-serif text-gray-400 mb-1">URL</label>
                  <input
                    type="text"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full bg-black/30 border border-genshin-gold/30 rounded px-4 py-2 text-white focus:border-genshin-gold focus:outline-none transition-colors"
                    placeholder="e.g., google.com"
                  />
                </div>
                )}
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-serif">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-gradient-to-r from-genshin-gold to-[#bfa87a] text-genshin-dark font-bold rounded shadow-lg transition-all font-serif">Forge</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1e2235] w-full max-w-sm rounded-xl border border-genshin-gold/60 p-6 relative shadow-[0_0_50px_rgba(255,0,0,0.15)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Background Deco */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/30 text-red-400">
                      <AlertCircle size={24} />
                  </div>
                  
                  <h3 className="text-xl font-serif text-gray-100 mb-2">Delete Artifact?</h3>
                  <p className="text-sm text-gray-400 font-sans mb-6">
                      Are you sure you want to remove <span className="text-genshin-gold font-bold">"{deleteRequest.itemName}"</span>? This action cannot be undone.
                  </p>

                  <div className="flex w-full gap-3">
                      <button 
                        onClick={() => setDeleteRequest(null)}
                        className="flex-1 py-2 rounded border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-serif"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2 rounded bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg hover:shadow-red-900/50 border border-white/10 transition-all font-serif"
                      >
                          Confirm
                      </button>
                  </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;