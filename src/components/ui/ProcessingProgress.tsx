import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface ProcessingProgressProps {
  status: ProcessingStatus;
  progress: number;
  message?: string;
  error?: string;
}

export function ProcessingProgress({ status, progress, message, error }: ProcessingProgressProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-600" />;
      case 'completed':
        return <Check className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (message) return message;
    switch (status) {
      case 'uploading':
        return 'Uploading files...';
      case 'processing':
        return 'Processing your PDF...';
      case 'completed':
        return 'Processing complete!';
      case 'error':
        return error || 'An error occurred';
      default:
        return 'Ready to process';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{getStatusText()}</p>
          {status !== 'idle' && status !== 'error' && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{progress}% complete</p>
          )}
        </div>
      </div>

      {(status === 'uploading' || status === 'processing') && (
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className={`h-full ${getStatusColor()} rounded-full`}
          />
        </div>
      )}

      {status === 'completed' && (
        <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-700 dark:text-green-400 font-medium">
            Your file is ready for download
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-700 dark:text-red-400 font-medium">Processing failed</p>
            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
          </div>
        </div>
      )}
    </motion.div>
  );
}
