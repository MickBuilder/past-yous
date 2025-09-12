/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateDecadeImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import { createAlbumPage } from './lib/albumUtils';
import Footer from './components/Footer';
import { redirectToCheckout } from './services/stripeService';

const DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

// Pre-defined positions for a scattered look on desktop
const POSITIONS = [
    { top: '5%', left: '10%', rotate: -8 },
    { top: '15%', left: '60%', rotate: 5 },
    { top: '45%', left: '5%', rotate: 3 },
    { top: '2%', left: '35%', rotate: 10 },
    { top: '40%', left: '70%', rotate: -12 },
    { top: '50%', left: '38%', rotate: -3 },
];

const GHOST_POLAROIDS_CONFIG = [
  { initial: { x: "-150%", y: "-100%", rotate: -30 }, transition: { delay: 0.2 } },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  { initial: { x: "-120%", y: "120%", rotate: 45 }, transition: { delay: 0.6 } },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];

const EXAMPLE_IMAGES = {
    '60s': "/images/60s-example.jpg",
    '70s': "/images/70s-example.jpg", 
    '80s': "/images/80s-example.jpg",
    '90s': "/images/90s-example.jpg",
    '2000s': "/images/2000s-example.jpg",
};

type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

const primaryButtonClasses = "font-mono text-lg text-center text-[var(--primary-foreground)] bg-[var(--primary)] py-3 px-8 rounded-[var(--radius)] transform transition-transform duration-200 hover:scale-105 shadow-lg";
const secondaryButtonClasses = "font-mono text-lg text-center text-[var(--foreground)] bg-transparent border border-[var(--border)] py-3 px-8 rounded-[var(--radius)] transform transition-transform duration-200 hover:scale-105 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

// --- Rolling Gallery Component ---
const RollingGallery = () => {
    // Use entries to get both decade and image source
    const images = Object.entries(EXAMPLE_IMAGES);
    // Duplicate images for a seamless loop
    const galleryContent = [...images, ...images];

    return (
        <div className="rolling-gallery" data-testid="rolling-gallery">
            <div className="rolling-gallery-inner" data-testid="rolling-gallery-inner">
                {galleryContent.map(([decade, src], index) => (
                    <div key={index} className="flex-shrink-0 py-4">
                         <PolaroidCard
                            imageUrl={src}
                            caption={`The ${decade.replace('s', "'s")}`}
                            status="done"
                            // Use the non-draggable version of the card for the gallery
                            isMobile={true} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Landing Page Component ---
const LandingPage = () => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'cancelled') {
            const storedImage = sessionStorage.getItem('uploadedImage');
            if (storedImage) {
                setUploadedImage(storedImage);
                setAppState('image-uploaded');
            }
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUrl = reader.result as string;
                setUploadedImage(imageDataUrl);
                setAppState('image-uploaded');
                sessionStorage.setItem('uploadedImage', imageDataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaymentClick = async () => {
        if (!uploadedImage) return;
        setIsPaying(true);
        try {
            await redirectToCheckout();
        } catch (error) {
            console.error("Failed to redirect to checkout:", error);
            alert("Could not connect to payment. Please try again.");
            setIsPaying(false);
        }
    };

    const handleChangeImageClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative isolate">
            <input id="file-upload" ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-mono font-bold">Past Yous</h1>
                    <p className="font-sans text-[var(--muted-foreground)] mt-2 text-xl tracking-wide">See yourself through the decades.</p>
                </div>

                {appState === 'idle' && (
                    <div className="relative flex flex-col items-center justify-center w-full">
                        {GHOST_POLAROIDS_CONFIG.map((config, index) => (
                            <motion.div
                                key={index}
                                className="absolute w-80 h-[26rem] rounded-md p-4 bg-[var(--foreground)]/5 blur-sm"
                                initial={config.initial}
                                animate={{ x: "0%", y: "0%", rotate: (Math.random() - 0.5) * 20, scale: 0, opacity: 0 }}
                                transition={{ ...config.transition, ease: "circOut", duration: 2 }}
                            />
                        ))}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="flex flex-col items-center w-full max-w-4xl"
                        >
                            <div className="mb-20 text-center">
                                <label htmlFor="file-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300 inline-block">
                                    <PolaroidCard caption="Click to Upload" status="done" />
                                </label>
                            </div>

                            <div className="text-center max-w-2xl mx-auto mt-8">
                                <h2 className="text-4xl font-mono font-bold tracking-tight">Travel Through Time</h2>
                                <p className="mt-4 text-lg text-[var(--muted-foreground)]">
                                    Ever wondered what you'd look like in a different era? Upload a single photo, and our AI will reimagine you in the iconic styles of past decades.
                                </p>
                            </div>

                            <div className="mt-12 w-full">
                                <RollingGallery />
                            </div>
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <div className="flex flex-col items-center gap-6">
                        <PolaroidCard imageUrl={uploadedImage} caption="Your Photo" status="done" onChangeImage={handleChangeImageClick} />
                        <div className="flex items-center gap-4 mt-4">
                            <button onClick={handlePaymentClick} disabled={isPaying} className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isPaying ? 'Redirecting...' : 'Pay $2.00 to Generate'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
};

// --- Results Page Component ---
const ResultsPage = () => {
    const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [isGenerationStarted, setIsGenerationStarted] = useState(false);
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');

        if (paymentStatus === 'success' && !isGenerationStarted) {
            const storedImage = sessionStorage.getItem('uploadedImage');
            if (storedImage) {
                setIsGenerationStarted(true);
                startGeneration(storedImage);
                sessionStorage.removeItem('uploadedImage');
                window.history.replaceState(null, '', `${window.location.pathname}?page=results`);
            } else {
                console.warn("Payment success, but no image found. Redirecting to home.");
                window.location.href = '/';
            }
        } else if (!paymentStatus) {
            // If someone lands here directly without payment, check for a stored image
             const storedImage = sessionStorage.getItem('uploadedImage');
             if (!storedImage) {
                console.log("No image found, redirecting home.");
                window.location.href = '/';
             } else {
                // This case should not be hit in normal flow, but as a fallback:
                 setIsGenerationStarted(true);
                 startGeneration(storedImage);
                 sessionStorage.removeItem('uploadedImage');
             }
        }
    }, [isGenerationStarted]);

    const startGeneration = async (imageDataUrl: string) => {
        setIsLoading(true);
        const initialImages: Record<string, GeneratedImage> = {};
        DECADES.forEach(decade => { initialImages[decade] = { status: 'pending' }; });
        setGeneratedImages(initialImages);

        const concurrencyLimit = 2;
        const decadesQueue = [...DECADES];

        const processDecade = async (decade: string) => {
            try {
                const prompt = `Reimagine the person in this photo in the style of the ${decade}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
                const resultUrl = await generateDecadeImage(imageDataUrl, prompt);
                setGeneratedImages(prev => ({ ...prev, [decade]: { status: 'done', url: resultUrl } }));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages(prev => ({ ...prev, [decade]: { status: 'error', error: errorMessage } }));
                console.error(`Failed to generate image for ${decade}:`, err);
            }
        };

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (decadesQueue.length > 0) {
                const decade = decadesQueue.shift();
                if (decade) await processDecade(decade);
            }
        });

        await Promise.all(workers);
        setIsLoading(false);
    };

    const handleReset = () => {
        sessionStorage.removeItem('uploadedImage');
        window.location.href = '/';
    };

    const handleDownloadIndividualImage = (decade: string) => {
        const image = generatedImages[decade];
        if (image?.status === 'done' && image.url) {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `past-yous-${decade}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAlbum = async () => {
        setIsDownloading(true);
        try {
            const imageData = Object.entries(generatedImages)
                .filter(([, image]) => image.status === 'done' && image.url)
                .reduce((acc, [decade, image]) => ({ ...acc, [decade]: image!.url! }), {} as Record<string, string>);

            if (Object.keys(imageData).length === 0) {
                alert("No images were generated successfully. Cannot create an album.");
                return;
            }

            const albumDataUrl = await createAlbumPage(imageData);
            const link = document.createElement('a');
            link.href = albumDataUrl;
            link.download = 'past-yous-album.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to create or download album:", error);
            alert("Sorry, there was an error creating your album. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const allDone = Object.values(generatedImages).every(img => img.status !== 'pending') && Object.keys(generatedImages).length > 0;

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative isolate">
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-mono font-bold">Past Yous</h1>
                    <p className="font-sans text-[var(--muted-foreground)] mt-2 text-xl tracking-wide">Your journey through time.</p>
                </div>
                {isMobile ? (
                    <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-8 p-4">
                        {DECADES.map(decade => (
                            <div key={decade} className="flex justify-center">
                                <PolaroidCard caption={decade} status={generatedImages[decade]?.status || 'pending'} imageUrl={generatedImages[decade]?.url} error={generatedImages[decade]?.error} onDownload={handleDownloadIndividualImage} isMobile={isMobile} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div ref={dragAreaRef} className="relative w-full max-w-5xl h-[600px] mt-4">
                        {DECADES.map((decade, index) => {
                            const { top, left, rotate } = POSITIONS[index];
                            return (
                                <motion.div key={decade} className="absolute cursor-grab active:cursor-grabbing shadow-xl hover:shadow-2xl transition-shadow rounded-md" style={{ top, left }} initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }} animate={{ opacity: 1, scale: 1, y: 0, rotate: `${rotate}deg` }} transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.15 }}>
                                    <PolaroidCard dragConstraintsRef={dragAreaRef} caption={decade} status={generatedImages[decade]?.status || 'pending'} imageUrl={generatedImages[decade]?.url} error={generatedImages[decade]?.error} onDownload={handleDownloadIndividualImage} isMobile={isMobile} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
                <div className="h-20 mt-4 flex items-center justify-center">
                    {allDone && (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button onClick={handleDownloadAlbum} disabled={isDownloading} className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isDownloading ? 'Creating Album...' : 'Download Album'}
                            </button>
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                Start Over
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
};


// --- Main App Router ---
function App() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');

    if (page === 'results') {
        return <ResultsPage />;
    }

    return <LandingPage />;
}

export default App;