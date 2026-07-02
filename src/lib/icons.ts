import {
  FileText,
  Layers,
  Scissors,
  Archive,
  RotateCw,
  Trash2,
  FileOutput,
  Move,
  Droplet,
  Lock,
  Unlock,
  Table,
  Presentation,
  Image,
  Code,
  FileType,
} from 'lucide-react';

// Map icon names to components
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Layers,
  Scissors,
  Archive,
  RotateCw,
  Trash2,
  FileOutput,
  Move,
  Droplet,
  Lock,
  Unlock,
  Table,
  Presentation,
  Image,
  Code,
  FileType,
};

export function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || FileText;
}
