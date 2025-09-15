import React from 'react';

interface FooterProps {
    onPrivacyClick: () => void;
    onSupportClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onPrivacyClick, onSupportClick }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[var(--card)] p-2 sm:p-3 z-50 text-[var(--muted-foreground)] text-xs sm:text-sm border-t border-[var(--border)]">
            <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col gap-2 sm:hidden">
                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={onPrivacyClick}
                            className="hover:text-[var(--foreground)] transition-colors duration-200 text-xs"
                        >
                            Privacy Policy
                        </button>
                        <button 
                            onClick={onSupportClick}
                            className="hover:text-[var(--foreground)] transition-colors duration-200 text-xs"
                        >
                            Support
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-xs">&copy; {currentYear} Past Yous. All Rights Reserved.</p>
                    </div>
                </div>

                {/* Desktop Layout - Side by Side */}
                <div className="hidden sm:flex justify-between items-center gap-4">
                    {/* Left Side */}
                    <div className="flex items-center gap-4 whitespace-nowrap">
                        <p>&copy; {currentYear} Past Yous. All Rights Reserved.</p>
                    </div>

                    {/* Right Side - Navigation Links */}
                    <div className="flex items-center gap-4 whitespace-nowrap">
                        <button 
                            onClick={onPrivacyClick}
                            className="hover:text-[var(--foreground)] transition-colors duration-200"
                        >
                            Privacy Policy
                        </button>
                        <button 
                            onClick={onSupportClick}
                            className="hover:text-[var(--foreground)] transition-colors duration-200"
                        >
                            Support
                        </button>
                        <p>Powered by Gemini</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;