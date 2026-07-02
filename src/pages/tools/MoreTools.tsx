import React, { useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { Download, ArrowLeft, RefreshCw, Check, AlertCircle, Lock, Unlock, Droplet } from 'lucide-react';
import { FileUpload } from '../../components/ui/FileUpload';
import { ProcessingProgress, ProcessingStatus } from '../../components/ui/ProcessingProgress';
import { Button } from '../../components/ui/Button';
import { PDF_TOOLS } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function ToolInfoSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600 text-lg font-bold">i</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
              {index + 1}
            </span>
            <span className="text-gray-600 dark:text-gray-400">{step}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}

function GenericToolPage({
  toolId,
  title,
  description,
  processFunction,
  infoSteps,
  acceptTypes,
  maxFiles = 1,
}: {
  toolId: string;
  title: string;
  description: string;
  processFunction: (files: File[], options?: any) => Promise<Blob | null>;
  infoSteps: string[];
  acceptTypes: Record<string, string[]>;
  maxFiles?: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(prev => maxFiles === 1 ? newFiles : [...prev, ...newFiles]);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, [maxFiles]);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = async () => {
    if (files.length === 0) return;

    setStatus('uploading');
    setProgress(10);
    setError(null);

    try {
      setStatus('processing');
      setProgress(30);

      const blob = await processFunction(files);

      if (!blob) throw new Error('Processing failed');

      setProgress(90);

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: toolId,
        user_id: user?.id || null,
        file_count: files.length,
        processing_time_ms: Date.now(),
      });

      toast.success('Processing completed successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to process files');
      toast.error('Failed to process files');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      const ext = files[0].name.split('.').pop() || 'pdf';
      a.download = `processed-${toolId}.${ext === 'pdf' ? 'pdf' : 'zip'}`;
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        {status === 'idle' && (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={acceptTypes}
            maxFiles={maxFiles}
            currentFiles={files}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Processing your files..." />
        )}

        {status === 'completed' && resultUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your file has been processed successfully
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download Result
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Process Another File
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {status === 'idle' && files.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>
              Process {files.length} File{files.length > 1 ? 's' : ''}
            </Button>
          </div>
        )}

        <ToolInfoSection title={`How to ${title}`} steps={infoSteps} />
      </div>
    </div>
  );
}

export function DeletePagesPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagesToDelete, setPagesToDelete] = useState('');
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, []);

  const processFiles = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(20);
    setError(null);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      const pageNumbers = pagesToDelete
        .split(',')
        .map(p => parseInt(p.trim()) - 1)
        .filter(p => !isNaN(p) && p >= 0 && p < totalPages);

      if (pageNumbers.length === 0) {
        throw new Error('Invalid page numbers');
      }

      const pagesToKeep = Array.from({ length: totalPages }, (_, i) => i).filter(i => !pageNumbers.includes(i));

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, pagesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'delete-pages',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('Pages deleted successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to delete pages');
      toast.error('Failed to delete pages');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'modified-document.pdf';
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Delete PDF Pages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Remove specific pages from your PDF document.
          </p>
        </div>

        {status === 'idle' && (
          <>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept={{ 'application/pdf': ['.pdf'] }}
              maxFiles={1}
              currentFiles={files}
              onRemoveFile={() => setFiles([])}
            />

            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Pages to Delete</h3>
                <input
                  type="text"
                  value={pagesToDelete}
                  onChange={(e) => setPagesToDelete(e.target.value)}
                  placeholder="Enter page numbers (e.g., 1, 3, 5-7)"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Separate page numbers with commas. Use hyphens for ranges (e.g., 1-5).
                </p>
              </motion.div>
            )}

            {files.length > 0 && pagesToDelete && (
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>
                  Delete Pages
                </Button>
              </div>
            )}
          </>
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Deleting pages..." />
        )}

        {status === 'completed' && resultUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Pages Deleted Successfully!
            </h3>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download Modified PDF
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Edit Another File
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <ToolInfoSection
          title="How to Delete PDF Pages"
          steps={[
            'Upload your PDF file',
            'Enter the page numbers you want to delete',
            'Click "Delete Pages" to process',
            'Download your modified PDF',
          ]}
        />
      </div>
    </div>
  );
}

export { GenericToolPage, ToolInfoSection };
