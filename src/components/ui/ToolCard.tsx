import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PDFTool } from '../../types';

interface ToolCardProps {
  tool: PDFTool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[tool.icon] || LucideIcons.FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={tool.path}
        className="group block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-600 transition-colors">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {tool.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface ToolGridProps {
  tools: PDFTool[];
  title?: string;
  description?: string;
}

export function ToolGrid({ tools, title, description }: ToolGridProps) {
  return (
    <div>
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    </div>
  );
}
