import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, Sparkles, Check, Zap, Shield, Clock, FileText, Users, Globe } from 'lucide-react';
import { ToolGrid } from '../components/ui/ToolCard';
import { TestimonialsSection } from '../components/ui/TestimonialCard';
import { StatsSection } from '../components/ui/StatsSection';
import { FAQSection } from '../components/ui/FAQSection';
import { PDF_TOOLS, TOOL_CATEGORIES } from '../types';
import { getIcon } from '../lib/icons';

export function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <HeroSection />
      <QuickToolsSection />
      <StatsSection />
      <FeaturesSection />
      <AllToolsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Trusted by 10 million+ users worldwide
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            All PDF Tools You Need{' '}
            <span className="text-blue-600">in One Place</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Merge, Split, Compress, Convert and Edit PDFs completely online.
            Fast, secure, and free to use. No installation required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/tools"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 font-medium text-lg"
            >
              <Upload className="w-5 h-5" />
              Start Processing PDFs
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 px-8 py-4 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-lg"
            >
              Explore Premium Features
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No registration
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Free forever
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Files auto-delete
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function QuickToolsSection() {
  const quickTools = PDF_TOOLS.slice(0, 8);

  return (
    <section className="py-20 bg-white dark:bg-gray-900 -mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quick Access Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select a tool to get started instantly
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickTools.map((tool, index) => {
              const IconComponent = getIcon(tool.icon);
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={tool.path}
                    className="group flex flex-col items-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow-lg"
                  >
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow mb-3">
                      <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-center text-sm">
                      {tool.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Process your PDFs in seconds with our optimized cloud infrastructure.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bank-Level Security',
      description: 'End-to-end encryption ensures your documents stay private and secure.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Auto-Delete',
      description: 'Files are automatically deleted after 1 hour. Your privacy guaranteed.',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Works Everywhere',
      description: 'Access from any device. No software installation required.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Friendly',
      description: 'Share links and collaborate on documents with your team.',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'All Formats',
      description: 'Support for PDF, Word, Excel, PowerPoint, Images, and more.',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose PDF Master?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We combine powerful features with simplicity to give you the best PDF experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AllToolsSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {TOOL_CATEGORIES.map((category) => (
          <div key={category.id} className="mb-16 last:mb-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
              </div>
              <Link
                to={`/tools/category/${category.id}`}
                className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.tools.map((tool, index) => {
                const IconComponent = getIcon(tool.icon);
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={tool.path}
                      className="group block p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 transition-colors">
                          <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to simplify your PDF workflow?
        </h2>
        <p className="text-blue-100 mb-8 text-lg">
          Join millions of users who trust PDF Master for their document needs
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
          <Link
            to="/premium"
            className="px-8 py-4 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors"
          >
            View Premium Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
