import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { Download, ArrowLeft, RefreshCw, Info, Check, AlertCircle } from 'lucide-react';
import { FileUpload } from '../../components/ui/FileUpload';
import { ProcessingProgress, ProcessingStatus } from '../../components/ui/ProcessingProgress';
import { Button } from '../../components/ui/Button';
import { PDF_TOOLS } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setStatus('uploading');
    setProgress(10);
    setError(null);

    try {
      setStatus('processing');
      setProgress(20);

      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        setProgress(20 + Math.floor((i / files.length) * 60));
      }

      setProgress(85);
      const pdfBytes = await mergedPdf.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'merge',
        user_id: user?.id || null,
        file_count: files.length,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF merged successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to merge PDF files');
      toast.error('Failed to merge PDF files');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'merged-document.pdf';
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
            Merge PDF Files
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Combine multiple PDF files into a single document. Drag to reorder files before merging.
          </p>
        </div>

        {status === 'idle' && (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={20}
            currentFiles={files}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Merging your PDF files..." />
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
              PDF Merged Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your {files.length} PDF files have been merged into one document
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download Merged PDF
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Merge More Files
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

        {status === 'idle' && files.length >= 2 && (
          <div className="mt-6 flex justify-center">
            <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>
              Merge {files.length} PDF Files
            </Button>
          </div>
        )}

        <ToolInfoSection
          title="How to Merge PDF Files"
          steps={[
            'Select or drag and drop your PDF files',
            'Arrange the files in the order you want them merged',
            'Click the "Merge PDF Files" button',
            'Download your merged PDF document',
          ]}
        />
      </div>
    </div>
  );
}

function ToolInfoSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
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

export function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<'all' | 'range'>('all');
  const [pageRange, setPageRange] = useState('');
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrls([]);
    setError(null);
  }, []);

  const processFiles = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      setProgress(30);

      const urls: string[] = [];

      if (splitMode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          urls.push(URL.createObjectURL(blob));
          setProgress(30 + Math.floor((i / totalPages) * 50));
        }
      } else {
        const ranges = pageRange.split(',').map(r => r.trim());
        for (const range of ranges) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1);
          if (!isNaN(start) && !isNaN(end)) {
            const newPdf = await PDFDocument.create();
            const pageIndices = [];
            for (let i = start; i <= end && i < totalPages; i++) {
              if (i >= 0) pageIndices.push(i);
            }
            const pages = await newPdf.copyPages(pdf, pageIndices);
            pages.forEach(page => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            urls.push(URL.createObjectURL(blob));
          }
        }
      }

      setProgress(100);
      setStatus('completed');
      setResultUrls(urls);

      await supabase.from('tool_analytics').insert({
        tool_name: 'split',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF split successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
      toast.error('Failed to split PDF');
    }
  };

  const handleDownload = (index: number) => {
    if (resultUrls[index]) {
      const a = document.createElement('a');
      a.href = resultUrls[index];
      a.download = `page-${index + 1}.pdf`;
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrls([]);
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
            Split PDF File
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Separate PDF pages into multiple files. Choose to extract all pages or specific page ranges.
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Split Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'all'}
                      onChange={() => setSplitMode('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Split into individual pages (one file per page)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'range'}
                      onChange={() => setSplitMode('range')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Extract specific page ranges
                    </span>
                  </label>
                  {splitMode === 'range' && (
                    <input
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-3, 5, 7-10"
                      className="w-full mt-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {files.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>
                  Split PDF
                </Button>
              </div>
            )}
          </>
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Splitting your PDF..." />
        )}

        {status === 'completed' && resultUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                PDF Split Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Created {resultUrls.length} separate PDF files
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {resultUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDownload(index)}
                  className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Page {index + 1}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Split Another File
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
          title="How to Split PDF Files"
          steps={[
            'Upload your PDF file',
            'Choose to split all pages or specific ranges',
            'Click "Split PDF" to process',
            'Download individual pages or ranges',
          ]}
        />
      </div>
    </div>
  );
}

export function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setOriginalSize(newFiles[0]?.size || 0);
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
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      setProgress(50);

      const pdfBytes = await pdf.save({
        useObjectStreams: true,
      });

      setProgress(90);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedSize(blob.size);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'compress',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF compressed successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to compress PDF');
      toast.error('Failed to compress PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'compressed-document.pdf';
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

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
            Compress PDF
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reduce PDF file size while maintaining quality. Perfect for email attachments and web uploads.
          </p>
        </div>

        {status === 'idle' && (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            currentFiles={files}
            onRemoveFile={() => setFiles([])}
          />
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Compressing your PDF..." />
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
              PDF Compressed Successfully!
            </h3>
            <div className="flex items-center justify-center gap-8 my-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Original</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSize(originalSize)}</p>
              </div>
              <ArrowLeft className="w-6 h-6 text-gray-400 rotate-180" />
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Compressed</p>
                <p className="text-2xl font-bold text-green-600">{formatSize(compressedSize)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Saved</p>
                <p className="text-2xl font-bold text-blue-600">{compressionRatio}%</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download Compressed PDF
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Compress Another File
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
              Compress PDF
            </Button>
          </div>
        )}

        <ToolInfoSection
          title="How to Compress PDF Files"
          steps={[
            'Upload your PDF file',
            'Click "Compress PDF" to start processing',
            'Wait while we optimize your file',
            'Download the compressed PDF',
          ]}
        />
      </div>
    </div>
  );
}

export function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
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

      setProgress(40);

      const pages = pdf.getPages();
      pages.forEach(page => {
        page.setRotation({ type: rotation === 90 ? 0 : rotation === 180 ? Math.PI : rotation === 270 ? -Math.PI / 2 : 0, angle: undefined as any });
        const currentRotation = page.getRotation().angle;
        page.setRotation({ angle: (currentRotation + rotation) % 360 as any });
      });

      setProgress(80);

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'rotate',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF rotated successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to rotate PDF');
      toast.error('Failed to rotate PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'rotated-document.pdf';
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
            Rotate PDF Pages
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rotate all pages in your PDF document to any angle.
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Rotation Options</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setRotation(90)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                      rotation === 90 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" style={{ transform: 'rotate(90deg)' }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">90 CW</span>
                  </button>
                  <button
                    onClick={() => setRotation(180)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                      rotation === 180 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" style={{ transform: 'rotate(180deg)' }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">180</span>
                  </button>
                  <button
                    onClick={() => setRotation(270)}
                    className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                      rotation === 270 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-700 dark:text-gray-300" style={{ transform: 'rotate(-90deg)' }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">90 CCW</span>
                  </button>
                </div>
              </motion.div>
            )}

            {files.length > 0 && (
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>
                  Rotate PDF
                </Button>
              </div>
            )}
          </>
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Rotating your PDF..." />
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
              PDF Rotated Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              All pages have been rotated {rotation} degrees
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download Rotated PDF
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Rotate Another File
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
          title="How to Rotate PDF Pages"
          steps={[
            'Upload your PDF file',
            'Select rotation angle (90, 180, or 270 degrees)',
            'Click "Rotate PDF" to process',
            'Download your rotated PDF',
          ]}
        />
      </div>
    </div>
  );
}

export function ToolsPage() {
  return PDF_TOOLS.map((tool, index) => (
    <div key={tool.id} className="p-4 border-b">{tool.name}</div>
  ));
}
