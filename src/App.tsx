import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { SEO } from './components/SEO';

// Pages
import { HomePage } from './pages/HomePage';
import { MergePDF, SplitPDF, CompressPDF, RotatePDF } from './pages/tools/ToolsPage';
import { DeletePagesPDF } from './pages/tools/MoreTools';
import { ImagesToPDF, PDFToImages } from './pages/tools/ConversionTools';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/auth/AuthPages';
import { DashboardPage, ProfilePage } from './pages/user/Dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BlogPage, BlogPostPage } from './pages/blog/Blog';
import { PremiumPage } from './pages/PremiumPage';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsOfServicePage, CookiePolicyPage } from './pages/info/InfoPages';

// All PDF Tools
import {
  RearrangePagesPDF,
  ProtectPDF,
  UnlockPDF,
  TextToPDF,
  HTMLToPDF,
  WordToPDF,
  ExcelToPDF,
  PowerPointToPDF,
  PDFToWord,
} from './components/tools/AllPDFTools';

// Tool components that use existing modules
import { FileUpload } from './components/ui/FileUpload';
import { ProcessingProgress, ProcessingStatus } from './components/ui/ProcessingProgress';
import { Button } from './components/ui/Button';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, RefreshCw, Check, AlertCircle } from 'lucide-react';

// Extract Pages Tool
function ExtractPagesPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageRange, setPageRange] = useState('');
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, []);

  const processFiles = async () => {
    if (files.length === 0 || !pageRange) return;

    setStatus('processing');
    setProgress(20);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      const ranges = pageRange.split(',').map(r => r.trim());
      const pageIndices: number[] = [];

      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1);
          for (let i = start; i <= end && i < totalPages; i++) {
            if (i >= 0) pageIndices.push(i);
          }
        } else {
          const page = parseInt(range) - 1;
          if (page >= 0 && page < totalPages) pageIndices.push(page);
        }
      }

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, pageIndices);
      pages.forEach(page => newPdf.addPage(page));

      setProgress(80);
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'extract-pages',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('Pages extracted successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to extract pages');
      toast.error('Failed to extract pages');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tools" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Extract PDF Pages</h1>
          <p className="text-gray-600 dark:text-gray-400">Extract specific pages from your PDF document.</p>
        </div>

        {status === 'idle' && (
          <>
            <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />
            {files.length > 0 && (
              <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Page Range</h3>
                <input type="text" value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder="e.g., 1-3, 5, 7-10" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                <p className="text-sm text-gray-500 mt-2">Specify pages to extract, separated by commas or ranges</p>
              </div>
            )}
            {files.length > 0 && pageRange && (
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>Extract Pages</Button>
              </div>
            )}
          </>
        )}

        {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Extracting pages..." />}

        {status === 'completed' && resultUrl && (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pages Extracted!</h3>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={() => { const a = document.createElement('a'); a.href = resultUrl; a.download = 'extracted-pages.pdf'; a.click(); }} icon={<Download className="w-4 h-4" />}>Download</Button>
              <Button variant="outline" onClick={() => { setFiles([]); setStatus('idle'); setResultUrl(null); setPageRange(''); }} icon={<RefreshCw className="w-4 h-4" />}>Extract More</Button>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Watermark PDF Tool
function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const { user } = useAuth();

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setStatus('idle');
    setResultUrl(null);
    setError(null);
  }, []);

  const processFiles = async () => {
    if (files.length === 0 || !watermarkText) return;

    setStatus('processing');
    setProgress(20);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont('Helvetica');

      setProgress(50);

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 50,
          font,
          color: { type: 'RGB', red: 0.8, green: 0.8, blue: 0.8 },
          opacity: 0.3,
          rotate: { type: 'degrees', angle: -45 },
        });
      });

      setProgress(80);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setProgress(100);
      setStatus('completed');

      await supabase.from('tool_analytics').insert({
        tool_name: 'watermark',
        user_id: user?.id || null,
        file_count: 1,
        processing_time_ms: Date.now(),
      });

      toast.success('Watermark added successfully!');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to add watermark');
      toast.error('Failed to add watermark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tools" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Watermark PDF</h1>
          <p className="text-gray-600 dark:text-gray-400">Add text watermark to your PDF document.</p>
        </div>

        {status === 'idle' && (
          <>
            <FileUpload onFilesSelected={handleFilesSelected} accept={{ 'application/pdf': ['.pdf'] }} maxFiles={1} currentFiles={files} onRemoveFile={() => setFiles([])} />
            {files.length > 0 && (
              <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">Watermark Text</h3>
                <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter watermark text" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
              </div>
            )}
            {files.length > 0 && watermarkText && (
              <div className="mt-6 flex justify-center">
                <Button onClick={processFiles} size="lg" icon={<RefreshCw className="w-5 h-5" />}>Add Watermark</Button>
              </div>
            )}
          </>
        )}

        {status !== 'idle' && status !== 'completed' && <ProcessingProgress status={status} progress={progress} message="Adding watermark..." />}

        {status === 'completed' && resultUrl && (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Watermark Added!</h3>
            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={() => { const a = document.createElement('a'); a.href = resultUrl; a.download = 'watermarked.pdf'; a.click(); }} icon={<Download className="w-4 h-4" />}>Download</Button>
              <Button variant="outline" onClick={() => { setFiles([]); setStatus('idle'); setResultUrl(null); setWatermarkText(''); }} icon={<RefreshCw className="w-4 h-4" />}>Add Another</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Image conversion tools
function JPGToPDF() {
  return <ImagesToPDF acceptTypes={{ 'image/jpeg': ['.jpg', '.jpeg'] }} toolId="jpg-to-pdf" title="JPG to PDF" />;
}

function PNGToPDF() {
  return <ImagesToPDF acceptTypes={{ 'image/png': ['.png'] }} toolId="png-to-pdf" title="PNG to PDF" />;
}

function PDFToJPG() {
  return <PDFToImages outputFormat="jpg" />;
}

function PDFToPNG() {
  return <PDFToImages outputFormat="png" />;
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <SEO
              title="All PDF Tools You Need in One Place"
              description="Merge, Split, Compress, Convert and Edit PDFs completely online. Fast, secure, and free to use."
              keywords="PDF merge, PDF split, PDF compress, PDF converter, online PDF tools"
            />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '12px',
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="tools" element={<HomePage />} />

                {/* Organize Tools */}
                <Route path="tools/merge" element={<MergePDF />} />
                <Route path="tools/split" element={<SplitPDF />} />
                <Route path="tools/compress" element={<CompressPDF />} />
                <Route path="tools/rotate" element={<RotatePDF />} />
                <Route path="tools/delete-pages" element={<DeletePagesPDF />} />
                <Route path="tools/extract-pages" element={<ExtractPagesPDF />} />
                <Route path="tools/rearrange" element={<RearrangePagesPDF />} />

                {/* Edit Tools */}
                <Route path="tools/watermark" element={<WatermarkPDF />} />

                {/* Security Tools */}
                <Route path="tools/protect" element={<ProtectPDF />} />
                <Route path="tools/unlock" element={<UnlockPDF />} />

                {/* Convert To PDF */}
                <Route path="tools/pdf-to-word" element={<PDFToWord />} />
                <Route path="tools/word-to-pdf" element={<WordToPDF />} />
                <Route path="tools/excel-to-pdf" element={<ExcelToPDF />} />
                <Route path="tools/ppt-to-pdf" element={<PowerPointToPDF />} />
                <Route path="tools/jpg-to-pdf" element={<JPGToPDF />} />
                <Route path="tools/png-to-pdf" element={<PNGToPDF />} />
                <Route path="tools/html-to-pdf" element={<HTMLToPDF />} />
                <Route path="tools/text-to-pdf" element={<TextToPDF />} />

                {/* Convert From PDF */}
                <Route path="tools/pdf-to-jpg" element={<PDFToJPG />} />
                <Route path="tools/pdf-to-png" element={<PDFToPNG />} />

                {/* Other Pages */}
                <Route path="premium" element={<PremiumPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="terms-of-service" element={<TermsOfServicePage />} />
                <Route path="cookie-policy" element={<CookiePolicyPage />} />
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
