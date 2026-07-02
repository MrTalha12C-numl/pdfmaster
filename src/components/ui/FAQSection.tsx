import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 text-gray-500 ${isOpen ? 'text-blue-600' : ''}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-gray-600 dark:text-gray-400">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const faqs = [
  {
    question: "Is PDF Master free to use?",
    answer: "Yes! PDF Master offers free access to all basic PDF tools. You can merge, split, compress, and convert PDFs without any cost. Premium features with larger file limits and priority processing are available with our paid plans.",
  },
  {
    question: "Are my files secure and private?",
    answer: "Absolutely. We use end-to-end encryption for all file transfers. Files are automatically deleted from our servers within 1 hour after processing. We never access, read, or share your documents with third parties.",
  },
  {
    question: "What is the maximum file size I can upload?",
    answer: "Free users can upload files up to 25MB. Premium subscribers can upload files up to 100MB per file. There are no daily limits on the number of files you can process.",
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation required! PDF Master works entirely in your web browser. Simply visit our website, select your tool, upload your file, and download the processed result. It works on Windows, Mac, Linux, and mobile devices.",
  },
  {
    question: "How long does file processing take?",
    answer: "Most files are processed within seconds. Larger files or complex operations may take up to a minute. Premium users receive priority processing for faster results.",
  },
  {
    question: "Can I use PDF Master on my mobile device?",
    answer: "Yes! PDF Master is fully responsive and works great on smartphones and tablets. You can process PDFs on the go from any device with a web browser.",
  },
  {
    question: "What file formats are supported?",
    answer: "We support a wide range of formats including PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, HTML, and TXT. You can convert between these formats and PDF easily.",
  },
  {
    question: "Can I password protect my PDFs?",
    answer: "Yes, our Protect PDF tool allows you to add password protection to your documents. You can set both user and owner passwords to control who can view, edit, print, or copy content from your PDF.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find answers to common questions about PDF Master
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
