import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Zap, Shield } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  index: number;
}

function StatItem({ icon, value, label, index }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="text-center p-6"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
        {icon}
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </motion.div>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem
            icon={<Users className="w-6 h-6 text-blue-600" />}
            value="10M+"
            label="Happy Users"
            index={0}
          />
          <StatItem
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            value="500M+"
            label="Files Processed"
            index={1}
          />
          <StatItem
            icon={<Zap className="w-6 h-6 text-blue-600" />}
            value="< 30s"
            label="Avg Processing Time"
            index={2}
          />
          <StatItem
            icon={<Shield className="w-6 h-6 text-blue-600" />}
            value="100%"
            label="Secure & Private"
            index={3}
          />
        </div>
      </div>
    </section>
  );
}
