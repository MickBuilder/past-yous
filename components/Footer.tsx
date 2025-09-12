/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[var(--card)] p-3 z-50 text-[var(--muted-foreground)] text-xs sm:text-sm border-t border-[var(--border)]">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                {/* Left Side */}
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <p>&copy; {currentYear} Mike B Apps</p>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <p>Powered by Gemini</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;