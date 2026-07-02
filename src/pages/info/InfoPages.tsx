import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare, FileText, Github, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export function AboutPage() {
  const team = [
    { name: 'Sarah Johnson', role: 'CEO & Founder', image: '' },
    { name: 'Michael Chen', role: 'CTO', image: '' },
    { name: 'Emily Rodriguez', role: 'Head of Product', image: '' },
    { name: 'David Kim', role: 'Head of Engineering', image: '' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission is to Simplify Document Management
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We believe everyone deserves access to powerful, easy-to-use PDF tools. Our platform helps millions of users worldwide work with documents effortlessly.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                PDF Master started in 2020 with a simple idea: make PDF tools accessible to everyone. We were tired of complicated software and expensive subscriptions.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Today, we serve millions of users worldwide, processing hundreds of thousands of PDFs daily. Our commitment to simplicity and security has made us one of the most trusted PDF platforms.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                We're constantly innovating, adding new features, and improving our service to meet your needs. Your feedback drives our development.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <p className="text-4xl font-bold text-blue-600 mb-2">10M+</p>
                <p className="text-gray-600 dark:text-gray-400">Users Worldwide</p>
              </div>
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <p className="text-4xl font-bold text-green-600 mb-2">500M+</p>
                <p className="text-gray-600 dark:text-gray-400">PDFs Processed</p>
              </div>
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                <p className="text-4xl font-bold text-purple-600 mb-2">20+</p>
                <p className="text-gray-600 dark:text-gray-400">PDF Tools</p>
              </div>
              <div className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                <p className="text-4xl font-bold text-orange-600 mb-2">99.9%</p>
                <p className="text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet the Team</h2>
            <p className="text-gray-600 dark:text-gray-400">The people behind PDF Master</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: 'general', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" loading={loading} icon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </form>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href="mailto:support@pdfmaster.com" className="text-gray-900 dark:text-white hover:text-blue-600">
                      support@pdfmaster.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
                <a href="#" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Last updated: January 1, 2024</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, such as when you create an account or upload files. This includes your name, email address, and any files you choose to process.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide our services, improve our platform, communicate with you, and ensure the security of our systems.</p>

          <h2>3. Data Security</h2>
          <p>All uploaded files are encrypted during transfer and processing. Files are automatically deleted within 1 hour of processing for free users and within 7 days for premium users.</p>

          <h2>4. Cookies</h2>
          <p>We use cookies to improve your experience, remember your preferences, and analyze traffic patterns. You can control cookie settings in your browser.</p>

          <h2>5. Third-Party Services</h2>
          <p>We may use third-party services for analytics, payment processing, and infrastructure. These services have their own privacy policies.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@pdfmaster.com for any requests.</p>

          <h2>7. Contact Us</h2>
          <p>For any questions about this Privacy Policy, contact us at privacy@pdfmaster.com.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Last updated: January 1, 2024</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using PDF Master, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily use PDF Master for personal or commercial purposes. This license does not include reselling or redistributing the service.</p>

          <h2>3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account. You agree not to upload malicious files or attempt to disrupt our services.</p>

          <h2>4. Disclaimer</h2>
          <p>PDF Master is provided "as is" without warranties of any kind. We do not guarantee the accuracy, reliability, or completeness of any results.</p>

          <h2>5. Limitations</h2>
          <p>In no event shall PDF Master be liable for any damages arising out of the use or inability to use the service.</p>

          <h2>6. Modifications</h2>
          <p>We may revise these terms at any time. Continued use of the service constitutes acceptance of revised terms.</p>
        </div>
      </div>
    </div>
  );
}

export function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Cookie Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Last updated: January 1, 2024</p>

          <h2>What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device that help us provide a better experience.</p>

          <h2>Types of Cookies We Use</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the service to function properly.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our service.</li>
            <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads.</li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling certain cookies may affect functionality.</p>
        </div>
      </div>
    </div>
  );
}
