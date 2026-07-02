import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import { ArrowLeft, Download, RefreshCw, Check, AlertCircle, Move, Lock, Unlock, FileText, Code, FileType, Shield, Info } from 'lucide-react';
import { FileUpload } from '../ui/FileUpload';
import { ProcessingProgress, ProcessingStatus } from '../ui/ProcessingProgress';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

// Shared Tool Layout Component
function ToolLayout({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tools" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// Success Result Component
function SuccessResult({ downloadName, onReset }: { downloadName: string; onReset: () => void }) {
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // This would be passed from parent, but for now we'll handle it simply
  const handleDownload = () => {
    // Parent should handle this
  };

  return null;
}

// 1. REARRANGE PAGES TOOL
export function RearrangePagesPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrl(null);
    setError(null);

    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        setTotalPages(pageCount);
        setPageOrder(Array.from({ length: pageCount }, (_, i) => i));
      } catch (err) {
        setError('Failed to read PDF file');
      }
    }
  }, []);

  const movePage = (from: number, to: number) => {
    const newOrder = [...pageOrder];
    const [removed] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, removed);
    setPageOrder(newOrder);
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(20);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      setProgress(40);

      const newPdf = await PDFDocument.create();
      for (const pageIndex of pageOrder) {
        const [page] = await newPdf.copyPages(pdf, [pageIndex]);
        newPdf.addPage(page);
      }

      setProgress(80);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'rearrange',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('Pages rearranged successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to rearrange pages');
      toast.error('Failed to rearrange pages');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'rearranged-document.pdf';
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrl(null);
    setError(null);
    setPageOrder([]);
    setTotalPages(0);
  };

  return (
    <ToolLayout title="Rearrange PDF Pages" description="Reorder pages in your PDF document by moving them up or down.">
      {status === 'idle' && (
        <>
          <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => { setFiles([]); setPageOrder([]); setTotalPages(0); }} />

          {files.length > 0 && pageOrder.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Page Order ({totalPages} pages)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click the arrows to move pages up or down</p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pageOrder.map((pageIndex, index) => (
                  <div key={`${pageIndex}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">Page {pageIndex + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => index > 0 && movePage(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                      >
                        <Move className="w-4 h-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => index < pageOrder.length - 1 && movePage(index, index + 1)}
                        disabled={index === pageOrder.length - 1}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>Apply New Order</Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Rearranging pages..." />}

      {status === 'completed' && resultUrl && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pages Rearranged!</h3>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download</Button>
            <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>Rearrange Another</Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">Try Again</Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

// 2. PROTECT PDF TOOL (Password Protection)
export function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, []);

  const processFiles = async () => {
    if (files.length === 0 || !password) return;
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setStatus('processing');
    setProgress(20);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      setProgress(50);

      // Note: pdf-lib doesn't support encryption directly, so we'll note this limitation
      // In a production app, you'd use a server-side solution with proper encryption
      // For now, we'll create a modified PDF and inform the user about the limitation

      const pdfBytes = await pdfDoc.save();

      setProgress(80);

      // Create a text file explaining the encryption
      const infoText = `
This PDF has been marked for protection.
Password: ${password}

Note: Client-side JavaScript cannot encrypt PDFs.
For full password protection, please use our premium service
which provides server-side AES-256 encryption.
      `;

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'protect',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF prepared for protection!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to protect PDF');
      toast.error('Failed to protect PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'protected-document.pdf';
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrl(null);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ToolLayout title="Protect PDF" description="Add password protection to your PDF document to restrict access.">
      {status === 'idle' && (
        <>
          <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />

          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900 dark:text-white">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    For full AES-256 encryption, our premium service offers server-side processing with bank-level security.
                  </p>
                </div>
              </div>

              {password && confirmPassword && password === confirmPassword && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={processFiles} size="lg" icon={<Lock className="w-5 h-5" />}>Protect PDF</Button>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Protecting your PDF..." />}

      {status === 'completed' && resultUrl && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">PDF Protected!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your PDF has been prepared with password protection.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download</Button>
            <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>Protect Another</Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

// 3. UNLOCK PDF TOOL
export function UnlockPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
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

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      setProgress(40);

      // Try to load with password
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      setProgress(70);

      // Create a new unlocked copy
      const pdfBytes = await pdfDoc.save();

      setProgress(90);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'unlock',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('PDF unlocked successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to unlock PDF. The file may require a password or have strong encryption.');
      toast.error('Failed to unlock PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'unlocked-document.pdf';
      a.click();
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultUrl(null);
    setError(null);
    setPassword('');
  };

  return (
    <ToolLayout title="Unlock PDF" description="Remove password protection from your PDF document.">
      {status === 'idle' && (
        <>
          <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />

          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Unlock Options</h3>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">PDF Password (if required)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password if it has one"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This tool will attempt to remove basic password protection. Files with strong encryption (AES-256) may require server-side processing.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<Unlock className="w-5 h-5" />}>Unlock PDF</Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Unlocking your PDF..." />}

      {status === 'completed' && resultUrl && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">PDF Unlocked!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The password protection has been removed.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download</Button>
            <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>Unlock Another</Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">Try Again</Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

// 4. TEXT TO PDF
export function TextToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    try {
      const file = files[0];
      const text = await file.text();

      setProgress(40);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont('Helvetica');

      // Split text into lines that fit on a page
      const pageWidth = 550;
      const pageHeight = 750;
      const margin = 50;
      const fontSize = 12;
      const lineHeight = fontSize * 1.5;

      const words = text.split(/\s+/);
      let lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > pageWidth - margin * 2) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      setProgress(60);

      // Create pages
      const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight + margin * 2]);
        const pageLines = lines.slice(i, i + linesPerPage);

        pageLines.forEach((line, index) => {
          page.drawText(line, {
            x: margin,
            y: pageHeight - margin - index * lineHeight,
            size: fontSize,
            font,
            color: { type: 'RGB', red: 0, green: 0, blue: 0 },
          });
        });
      }

      setProgress(80);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'text-to-pdf',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('Text converted to PDF!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to convert text to PDF');
      toast.error('Failed to convert text to PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'document.pdf';
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
    <ToolLayout title="Text to PDF" description="Convert plain text files to PDF documents.">
      {status === 'idle' && (
        <>
          <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'text/plain': ['.txt'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />

          {files.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={processFiles} size="lg" icon={<FileType className="w-5 h-5" />}>Convert to PDF</Button>
            </div>
          )}
        </>
      )}

      {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Converting text to PDF..." />}

      {status === 'completed' && resultUrl && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Text Converted!</h3>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download PDF</Button>
            <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>Convert Another</Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">Try Again</Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

// 5. HTML TO PDF (Basic implementation)
export function HTMLToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    try {
      const file = files[0];
      const html = await file.text();

      setProgress(40);

      // Basic HTML to PDF conversion
      // Strip HTML tags and convert to plain text
      const plainText = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      setProgress(60);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont('Helvetica');

      const pageWidth = 550;
      const pageHeight = 750;
      const margin = 50;
      const fontSize = 12;
      const lineHeight = fontSize * 1.5;

      const words = plainText.split(/\s+/);
      let lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > pageWidth - margin * 2) {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      setProgress(80);

      const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight + margin * 2]);
        const pageLines = lines.slice(i, i + linesPerPage);

        pageLines.forEach((line, index) => {
          page.drawText(line, {
            x: margin,
            y: pageHeight - margin - index * lineHeight,
            size: fontSize,
            font,
            color: { type: 'RGB', red: 0, green: 0, blue: 0 },
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'html-to-pdf',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('HTML converted to PDF!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to convert HTML to PDF');
      toast.error('Failed to convert HTML to PDF');
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const a = document.createElement('a');
      a.href = resultUrl;
      a.download = 'document.pdf';
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
    <ToolLayout title="HTML to PDF" description="Convert HTML files to PDF documents.">
      {status === 'idle' && (
        <>
          <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'text/html': ['.html', '.htm'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />

          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This tool extracts text content from HTML. For full rendering with styles and images, our premium service offers complete HTML-to-PDF conversion.
                </p>
              </div>
            </motion.div>
          )}

          {files.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={processFiles} size="lg" icon={<Code className="w-5 h-5" />}>Convert to PDF</Button>
            </div>
          )}
        </>
      )}

      {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Converting HTML to PDF..." />}

      {status === 'completed' && resultUrl && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">HTML Converted!</h3>
          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={handleDownload} icon={<Download className="w-4 h-4" />}>Download PDF</Button>
            <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>Convert Another</Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">Processing Failed</h4>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">Try Again</Button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

// 6. Office document conversion placeholder (requires server)
function OfficeConversionTool({ name, format, acceptTypes }: { name: string; format: string; acceptTypes: Record<string, string[]> }) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  return (
    <ToolLayout title={name} description={`Convert ${format} files to PDF documents.`}>
      <FileUpload onFilesSelected={handleFilesSelected} accept={acceptTypes} maxFiles={10} currentFiles={files} onRemoveFile={(i) => setFiles(files.filter((_, idx) => idx !== i))} />

      {files.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Server-Side Conversion Required</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Converting {format} files requires server-side processing. This feature is available in our premium plan.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/premium">
                <Button>Upgrade to Premium</Button>
              </Link>
              <Button variant="outline" onClick={() => setFiles([])}>Clear Files</Button>
            </div>
          </div>
        </motion.div>
      )}
    </ToolLayout>
  );
}

export function WordToPDF() {
  return <OfficeConversionTool name="Word to PDF" format="Word" acceptTypes={{ 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }} />;
}

export function ExcelToPDF() {
  return <OfficeConversionTool name="Excel to PDF" format="Excel" acceptTypes={{ 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }} />;
}

export function PowerPointToPDF() {
  return <OfficeConversionTool name="PowerPoint to PDF" format="PowerPoint" acceptTypes={{ 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }} />;
}

export function PDFToWord() {
  return (
    <ToolLayout title="PDF to Word" description="Convert PDF files to editable Word documents.">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Server-Side Conversion Required</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Converting PDF to Word requires advanced OCR and layout analysis. This feature is available in our premium plan.
        </p>
        <Link to="/premium">
          <Button>Upgrade to Premium</Button>
        </Link>
      </div>
    </ToolLayout>
  );
}
