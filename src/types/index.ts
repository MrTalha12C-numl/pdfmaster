export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string | null;
  original_name: string;
  file_path: string;
  file_size: number;
  tool_used: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface ToolAnalytics {
  id: string;
  tool_name: string;
  user_id: string | null;
  file_count: number;
  processing_time_ms: number | null;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  tool_name: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  featured_image_url: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'expired';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface VisitorStats {
  id: string;
  date: string;
  visitors_count: number;
  page_views: number;
  created_at: string;
}

export type PDFTool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'organize' | 'convert' | 'edit' | 'security';
  path: string;
  acceptTypes: string[];
  maxFiles: number;
};

export type ToolCategory = {
  id: string;
  name: string;
  description: string;
  tools: PDFTool[];
};

export const PDF_TOOLS: PDFTool[] = [
  { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDF files into one document', icon: 'Layers', category: 'organize', path: '/tools/merge', acceptTypes: ['.pdf'], maxFiles: 20 },
  { id: 'split', name: 'Split PDF', description: 'Separate PDF pages into multiple files', icon: 'Scissors', category: 'organize', path: '/tools/split', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'compress', name: 'Compress PDF', description: 'Reduce PDF file size without losing quality', icon: 'Archive', category: 'organize', path: '/tools/compress', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate PDF pages to any angle', icon: 'RotateCw', category: 'organize', path: '/tools/rotate', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'delete-pages', name: 'Delete PDF Pages', description: 'Remove unwanted pages from PDF', icon: 'Trash2', category: 'organize', path: '/tools/delete-pages', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'extract-pages', name: 'Extract Pages', description: 'Extract specific pages from PDF', icon: 'FileOutput', category: 'organize', path: '/tools/extract-pages', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'rearrange', name: 'Rearrange Pages', description: 'Reorder PDF pages by dragging', icon: 'Move', category: 'organize', path: '/tools/rearrange', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'watermark', name: 'Watermark PDF', description: 'Add text or image watermark to PDF', icon: 'Droplet', category: 'edit', path: '/tools/watermark', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'protect', name: 'Protect PDF', description: 'Add password protection to PDF', icon: 'Lock', category: 'security', path: '/tools/protect', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'unlock', name: 'Unlock PDF', description: 'Remove password from protected PDF', icon: 'Unlock', category: 'security', path: '/tools/unlock', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF to editable Word document', icon: 'FileText', category: 'convert', path: '/tools/pdf-to-word', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert Word documents to PDF', icon: 'FileText', category: 'convert', path: '/tools/word-to-pdf', acceptTypes: ['.doc', '.docx'], maxFiles: 10 },
  { id: 'excel-to-pdf', name: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF', icon: 'Table', category: 'convert', path: '/tools/excel-to-pdf', acceptTypes: ['.xls', '.xlsx'], maxFiles: 10 },
  { id: 'ppt-to-pdf', name: 'PowerPoint to PDF', description: 'Convert PowerPoint presentations to PDF', icon: 'Presentation', category: 'convert', path: '/tools/ppt-to-pdf', acceptTypes: ['.ppt', '.pptx'], maxFiles: 10 },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPG images to PDF', icon: 'Image', category: 'convert', path: '/tools/jpg-to-pdf', acceptTypes: ['.jpg', '.jpeg'], maxFiles: 50 },
  { id: 'png-to-pdf', name: 'PNG to PDF', description: 'Convert PNG images to PDF', icon: 'Image', category: 'convert', path: '/tools/png-to-pdf', acceptTypes: ['.png'], maxFiles: 50 },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Convert PDF pages to JPG images', icon: 'Image', category: 'convert', path: '/tools/pdf-to-jpg', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'pdf-to-png', name: 'PDF to PNG', description: 'Convert PDF pages to PNG images', icon: 'Image', category: 'convert', path: '/tools/pdf-to-png', acceptTypes: ['.pdf'], maxFiles: 1 },
  { id: 'html-to-pdf', name: 'HTML to PDF', description: 'Convert HTML pages to PDF', icon: 'Code', category: 'convert', path: '/tools/html-to-pdf', acceptTypes: ['.html', '.htm'], maxFiles: 10 },
  { id: 'text-to-pdf', name: 'Text to PDF', description: 'Convert text files to PDF', icon: 'FileType', category: 'convert', path: '/tools/text-to-pdf', acceptTypes: ['.txt'], maxFiles: 10 },
];

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'organize',
    name: 'Organize',
    description: 'Merge, split, and organize your PDF documents',
    tools: PDF_TOOLS.filter(t => t.category === 'organize'),
  },
  {
    id: 'convert',
    name: 'Convert',
    description: 'Convert PDF to and from various file formats',
    tools: PDF_TOOLS.filter(t => t.category === 'convert'),
  },
  {
    id: 'edit',
    name: 'Edit',
    description: 'Edit and modify your PDF documents',
    tools: PDF_TOOLS.filter(t => t.category === 'edit'),
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Protect and secure your PDF documents',
    tools: PDF_TOOLS.filter(t => t.category === 'security'),
  },
];

export const BLOG_CATEGORIES = [
  { id: 'pdf-tips', name: 'PDF Tips', slug: 'pdf-tips' },
  { id: 'office-guides', name: 'Office Guides', slug: 'office-guides' },
  { id: 'how-to', name: 'How-to Tutorials', slug: 'how-to' },
  { id: 'seo', name: 'SEO Articles', slug: 'seo' },
];
