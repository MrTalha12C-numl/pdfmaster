import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, Shield, Clock, Upload, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for occasional use',
    features: [
      '5 PDF operations per day',
      'Max file size: 25MB',
      'Basic tools access',
      'Standard processing speed',
      'Files auto-delete in 1 hour',
    ],
    limitations: ['Limited daily operations', 'Standard processing speed'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    description: 'For power users and professionals',
    features: [
      'Unlimited PDF operations',
      'Max file size: 100MB',
      'All premium tools access',
      'Priority processing',
      'Files stored for 7 days',
      'No advertisements',
      'Batch processing',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    description: 'For teams and businesses',
    features: [
      'Everything in Premium',
      'Max file size: 500MB',
      'API access',
      'Team collaboration',
      'Custom branding',
      'Dedicated support',
      'SLA guarantee',
      'On-premise deployment',
    ],
  },
];

export function PremiumPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Premium
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Full PDF Power
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get unlimited access to all PDF tools with no restrictions. Process files faster and more efficiently.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
          >
            <motion.div
              animate={{ x: billingCycle === 'yearly' ? 28 : 2 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-blue-600"
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            Yearly
            <span className="ml-1 text-green-600">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl border ${
                plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700'
              } p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${billingCycle === 'yearly' ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to={user ? `/checkout?plan=${plan.id}&billing=${billingCycle}` : '/signup'}>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Go Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Priority processing means your PDFs are ready in seconds, not minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No Limits</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Process as many files as you need with no daily restrictions.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Premium Tools</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access advanced features like batch processing and OCR technology.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions? We're here to help.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Contact our support team for any questions about premium features.
          </p>
          <Link to="/contact">
            <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
