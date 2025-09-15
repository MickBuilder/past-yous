import React from 'react';
import { motion } from 'framer-motion';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
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
        className="bg-[var(--card)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
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
            <h2 className="text-3xl font-bold text-white italic">PRIVACY POLICY</h2>
          </div>

          {/* Content */}
          <div className="space-y-6 text-[var(--muted-foreground)]">
            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">OUR COMMITMENT</h3>
              <p>Your privacy is important to us. This policy explains what information we collect and how we use it when you use Past Yous.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">INFORMATION COLLECTION</h3>
              <p>We collect personal data that you voluntarily provide to us, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Photos you upload for AI processing</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Usage analytics to improve our service</li>
                <li>Contact information if you reach out for support</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">IMAGE DATA</h3>
              <p>When you upload a photo, it is sent securely to Google's Gemini API for AI processing. We do not store your uploaded images on our servers after the generation process is complete. The generated images are temporarily available for you to view and download.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">USAGE DATA</h3>
              <p>To prevent abuse and ensure fair use, we use your browser's local storage to record usage patterns. This allows us to implement appropriate usage limits. This data is stored only on your device and is not transmitted to our servers unless necessary for service functionality.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">PAYMENT PROCESSING</h3>
              <p>All payments are processed securely through Stripe. We do not store your payment information on our servers. Stripe handles all payment data according to their security standards and PCI compliance requirements.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">THIRD-PARTY SERVICES</h3>
              <p>We use the following third-party services:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Google Gemini API:</strong> For AI image generation. Your use is subject to Google's Privacy Policy.</li>
                <li><strong>Stripe:</strong> For secure payment processing. Subject to Stripe's Privacy Policy.</li>
                <li><strong>Umami Analytics:</strong> For anonymous usage analytics to improve our service.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">DATA SECURITY</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal data. Your data is retained only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">YOUR RIGHTS</h3>
              <p>You are entitled to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Correct any inaccuracies</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white italic mb-3">CONTACT US</h3>
              <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at <a href="mailto:pastyous@mikebapps.com" className="text-yellow-500 hover:text-yellow-400">pastyous@mikebapps.com</a></p>
            </div>

            <div className="text-sm text-[var(--muted-foreground)] pt-4 border-t border-[var(--border)]">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
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

export default PrivacyPolicyModal;
