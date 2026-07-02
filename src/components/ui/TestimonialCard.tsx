import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
  index: number;
}

export function TestimonialCard({ quote, author, role, avatar, rating, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{author}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

const testimonials = [
  {
    quote: "PDF Master saved me hours of work. The merge and split features are incredibly fast and easy to use.",
    author: "Sarah Johnson",
    role: "Marketing Manager",
    rating: 5,
  },
  {
    quote: "Best online PDF tool I've ever used. No registration required and the files are processed instantly.",
    author: "Michael Chen",
    role: "Freelance Designer",
    rating: 5,
  },
  {
    quote: "The compression feature reduced my PDF from 50MB to just 5MB without any visible quality loss. Amazing!",
    author: "Emily Rodriguez",
    role: "Project Manager",
    rating: 5,
  },
  {
    quote: "I use PDF Master daily for converting documents. The interface is clean and intuitive.",
    author: "David Kim",
    role: "Software Engineer",
    rating: 4,
  },
  {
    quote: "Finally, a PDF tool that works on mobile devices. The responsive design is perfect.",
    author: "Lisa Thompson",
    role: "Sales Representative",
    rating: 5,
  },
  {
    quote: "The watermark feature helped me protect all my legal documents. Highly recommended!",
    author: "James Wilson",
    role: "Attorney",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by millions of users
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            See what our customers are saying about PDF Master
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
