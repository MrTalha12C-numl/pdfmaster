import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { Download, ArrowLeft, RefreshCw, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { FileUpload } from '../../components/ui/FileUpload';
import { ProcessingProgress, ProcessingStatus } from '../../components/ui/ProcessingProgress';
import { Button } from '../../components/ui/Button';
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

export function ImagesToPDF({ acceptTypes, toolId, title }: { acceptTypes: Record<string, string[]>; toolId: string; title: string }) {
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
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        let image;

        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });

        setProgress(10 + Math.floor((i / files.length) * 80));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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

      toast.success('PDF created successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create PDF');
      toast.error('Failed to create PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'images-converted.pdf';
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
          <p className="text-gray-600 dark:text-gray-400">
            Convert your images to a single PDF document. Supports JPEG and PNG formats.
          </p>
        </div>

        {status === 'idle' && (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={acceptTypes}
            maxFiles={50}
            currentFiles={files}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {status !== 'idle' && status !== 'completed' && (
          <ProcessingProgress status={status} progress={progress} message="Converting images to PDF..." />
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
              PDF Created Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {files.length} images converted to PDF
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
                Convert More Images
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
            <Button onClick={processFiles} size="lg" icon={<ImageIcon className="w-5 h-5" />}>
              Convert {files.length} Images to PDF
            </Button>
          </div>
        )}

        <ToolInfoSection
          title="How to Convert Images to PDF"
          steps={[
            'Select or drag and drop your image files',
            'Arrange images in the desired order',
            'Click "Convert Images to PDF"',
            'Download your PDF document',
          ]}
        />
      </div>
    </div>
  );
}

export function PDFToImages({ outputFormat }: { outputFormat: 'jpg' | 'png' }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
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
      const pageCount = pdf.getPageCount();

      const urls: string[] = [];

      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        urls.push(URL.createObjectURL(blob));

        setProgress(10 + Math.floor((i / pageCount) * 80));
      }

      setResultUrls(urls);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: `pdf-to-${outputFormat}`,
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF converted successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to convert PDF');
      toast.error('Failed to convert PDF');
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
            PDF to {outputFormat.toUpperCase()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convert each page of your PDF to a separate {outputFormat.toUpperCase()} image.
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
          <ProcessingProgress status={status} progress={progress} message="Converting PDF to images..." />
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
                Conversion Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {resultUrls.length} pages converted
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
                Convert Another PDF
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
            <Button onClick={processFiles} size="lg" icon={<ImageIcon className="w-5 h-5" />}>
              Convert to {outputFormat.toUpperCase()}
            </Button>
          </div>
        )}

        <ToolInfoSection
          title={`How to Convert PDF to ${outputFormat.toUpperCase()}`}
          steps={[
            'Upload your PDF file',
            'Click "Convert" to process',
            'Wait while we convert each page',
            'Download individual pages as images',
          ]}
        />
      </div>
    </div>
  );
}

export { ToolInfoSection };
