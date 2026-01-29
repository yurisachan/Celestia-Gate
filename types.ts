export interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconName?: string; // Fallback Lucide icon name
  iconUrl?: string;  // Favicon URL
  isCustom?: boolean;
}

export interface Category {
  id: string;
  title: string;
  folderSize?: '2x2' | '3x3'; // Logic for grid preview
  links: LinkItem[];
}

export type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'yandex';