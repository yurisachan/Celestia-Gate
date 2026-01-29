import { Category, LinkItem } from './types';
import { 
  Compass, 
  Map, 
  Scroll, 
  Sword, 
  ShoppingBag, 
  Youtube, 
  Github, 
  Code, 
  Mail, 
  Calendar,
  Image,
  Music
} from 'lucide-react';

// LAYOUT CONSTANTS
export const GRID_ITEM_CLASS = "w-[100px] h-[120px] md:w-[120px] md:h-[140px]"; 
export const GRID_GAP_CLASS = "gap-4"; 
export const GRID_ROWS_DESKTOP = 3;
export const GRID_COLS_DESKTOP = 8;
export const GRID_TOTAL_SLOTS = 24;
export const INITIAL_SLOT_INDICES = [2, 3, 4]; // 0-indexed positions for default items

// Define specific items
export const DEFAULT_LINK: LinkItem = {
  id: 'single-link',
  title: 'Traveler\'s Log',
  url: 'https://genshin.hoyoverse.com',
  iconName: 'Compass',
  isCustom: true
};

export const FOLDER_2X2: Category = {
  id: 'folder-2x2',
  title: 'Small Stash',
  folderSize: '2x2',
  links: [
    { id: 'g1', title: 'Gmail', url: 'https://mail.google.com', iconName: 'Mail' },
    { id: 'g2', title: 'Maps', url: 'https://maps.google.com', iconName: 'Map' },
    { id: 'g3', title: 'Calendar', url: 'https://calendar.google.com', iconName: 'Calendar' },
    { id: 'g4', title: 'Drive', url: 'https://drive.google.com', iconName: 'Scroll' },
  ]
};

export const FOLDER_3X3: Category = {
  id: 'folder-3x3',
  title: 'Treasure Trove',
  folderSize: '3x3',
  links: [
    { id: 't1', title: 'YouTube', url: 'https://youtube.com', iconName: 'Youtube' },
    { id: 't2', title: 'GitHub', url: 'https://github.com', iconName: 'Github' },
    { id: 't3', title: 'ChatGPT', url: 'https://chat.openai.com', iconName: 'Code' },
    { id: 't4', title: 'Netflix', url: 'https://netflix.com', iconName: 'Image' },
    { id: 't5', title: 'Spotify', url: 'https://open.spotify.com', iconName: 'Music' },
    { id: 't6', title: 'Shopping', url: 'https://amazon.com', iconName: 'ShoppingBag' },
    { id: 't7', title: 'Stack', url: 'https://stackoverflow.com', iconName: 'Scroll' },
    { id: 't8', title: 'Wiki', url: 'https://wikipedia.org', iconName: 'Compass' },
    { id: 't9', title: 'Hoyolab', url: 'https://www.hoyolab.com', iconName: 'Sword' },
  ]
};

// Raw items list for initialization
export const DEFAULT_ITEMS_LIST = [DEFAULT_LINK, FOLDER_2X2, FOLDER_3X3];
export const DEFAULT_CATEGORIES: Category[] = [FOLDER_2X2, FOLDER_3X3];

export const getIcon = (name: string, props: any) => {
  const icons: Record<string, any> = {
    Compass, Map, Scroll, Sword, ShoppingBag, Youtube, Github, Code, Mail, Calendar, Image, Music
  };
  const IconComponent = icons[name] || Compass;
  return <IconComponent {...props} />;
};