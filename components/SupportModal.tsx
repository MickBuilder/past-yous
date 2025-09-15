import React from 'react';
import { motion } from 'framer-motion';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--card)] rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white italic">CONTACT US</h2>
          </div>

          {/* Content */}
          <div className="space-y-6 text-[var(--muted-foreground)]">
            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">GET IN TOUCH</h3>
              <p className="mb-4">
                We'd love to hear from you! Whether you have a question about Past Yous, a suggestion for a new decade, 
                or a collaboration proposal, please feel free to reach out.
              </p>
              <p className="mb-4">
                The best way to contact us is via email. We'll do our best to get back to you as soon as possible.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">SUPPORT</h3>
              <p className="mb-4">
                Having trouble with image generation? Payment issues? Technical problems? 
                We're here to help! Please include as much detail as possible about your issue.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">FEEDBACK</h3>
              <p className="mb-4">
                We're constantly improving Past Yous. Your feedback helps us make the service better. 
                Share your ideas for new features, decades, or improvements!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">BUSINESS INQUIRIES</h3>
              <p className="mb-4">
                Interested in partnerships, collaborations, or business opportunities? 
                We'd love to explore how we can work together.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
              <p className="text-[var(--muted-foreground)] mb-2">Email:</p>
              <a 
                href="mailto:pastyous@mikebapps.com" 
                className="text-yellow-500 hover:text-yellow-400 font-mono text-lg transition-colors duration-200"
              >
                pastyous@mikebapps.com
              </a>
            </div>

            <div className="text-sm text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]">
              <p>We typically respond within 24-48 hours during business days.</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold italic py-4 px-6 rounded-lg transition-colors duration-200"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupportModal;
