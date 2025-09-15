import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { generateDecadeImage } from "./services/geminiService";
import PolaroidCard from "./components/PolaroidCard";
import { createAlbumPage } from "./lib/albumUtils";
import Footer from "./components/Footer";
import { redirectToCheckout } from "./services/stripeService";
import Hyperspeed from "./components/Hyperspeed";
import PrivacyPolicyModal from "./components/PrivacyPolicyModal";
import SupportModal from "./components/SupportModal";

// Umami tracking helper
const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).umami) {
        (window as any).umami.track(eventName, eventData);
    }
};

// Scroll depth tracking hook - only track meaningful milestones
const useScrollDepthTracking = () => {
  const [trackedDepths, setTrackedDepths] = useState<Set<number>>(new Set());
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Only track meaningful engagement milestones: 50% and 100%
      const depthsToTrack = [50, 100];
      
      depthsToTrack.forEach(depth => {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackEvent('user-engagement', { 
            milestone: scrollPercent >= 100 ? 'full-page-view' : 'half-page-view',
            scrollPercent: scrollPercent,
            timestamp: new Date().toISOString()
          });
          setTrackedDepths(prev => new Set([...prev, depth]));
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackedDepths]);
};

const DECADES = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s"];

// Pre-defined positions for a scattered look on desktop
const POSITIONS = [
  { top: "5%", left: "10%", rotate: -8 },
  { top: "15%", left: "60%", rotate: 5 },
  { top: "45%", left: "5%", rotate: 3 },
  { top: "2%", left: "35%", rotate: 10 },
  { top: "40%", left: "70%", rotate: -12 },
  { top: "50%", left: "38%", rotate: -3 },
];

const EXAMPLE_IMAGES = {
  "60s": "/images/60s-example.jpg",
  "70s": "/images/70s-example.jpg",
  "80s": "/images/80s-example.jpg",
  "90s": "/images/90s-example.jpg",
  "2000s": "/images/2000s-example.jpg",
};

type ImageStatus = "pending" | "done" | "error";
interface GeneratedImage {
  status: ImageStatus;
  url?: string;
  error?: string;
}

const primaryButtonClasses =
  "font-mono text-lg text-center text-[var(--primary-foreground)] bg-[var(--primary)] py-3 px-8 rounded-[var(--radius)] transform transition-transform duration-200 hover:scale-105 shadow-lg";
const secondaryButtonClasses =
  "font-mono text-lg text-center text-[var(--foreground)] bg-transparent border border-[var(--border)] py-3 px-8 rounded-[var(--radius)] transform transition-transform duration-200 hover:scale-105 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
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
      <div
        className="rolling-gallery-inner"
        data-testid="rolling-gallery-inner"
      >
        {galleryContent.map(([decade, src], index) => (
          <div key={index} className="flex-shrink-0 py-4">
            <PolaroidCard
              imageUrl={src}
              caption={`The ${decade.replace("s", "'s")}`}
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
  const [appState, setAppState] = useState<
    "idle" | "image-uploaded" | "generating" | "results"
  >("idle");
  const [generatedImages, setGeneratedImages] = useState<
    Record<string, GeneratedImage>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Initialize scroll depth tracking
  useScrollDepthTracking();

  // Track initial page load
  useEffect(() => {
    trackEvent('session-started', {
      timestamp: new Date().toISOString()
    });
  }, []);

  // Removed noisy app-state-change tracking


  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      trackEvent('photo-selected', {
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setUploadedImage(imageDataUrl);
        setAppState("image-uploaded");
        
        // Store image with error handling for mobile browsers
        try {
          sessionStorage.setItem("uploadedImage", imageDataUrl);
          console.log('Image stored in sessionStorage successfully, length:', imageDataUrl.length);
        } catch (error) {
          console.error('Failed to store image in sessionStorage:', error);
          // Fallback: store in localStorage if sessionStorage fails
          try {
            localStorage.setItem("uploadedImage", imageDataUrl);
            console.log('Image stored in localStorage as fallback');
          } catch (localError) {
            console.error('Failed to store image in localStorage:', localError);
          }
        }
        
        trackEvent('photo-ready', {
          imageSize: imageDataUrl.length,
          timestamp: new Date().toISOString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentClick = async () => {
    if (!uploadedImage) return;
    setIsPaying(true);
    
    trackEvent('checkout-started', {
      timestamp: new Date().toISOString()
    });

    try {
      await redirectToCheckout();
    } catch (error) {
      console.error("Failed to redirect to checkout:", error);
      trackEvent('payment-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      alert("Could not connect to payment. Please try again.");
      setIsPaying(false);
    }
  };

  const handleChangeImageClick = () => {
    trackEvent('change-image-clicked', {
      timestamp: new Date().toISOString()
    });
    fileInputRef.current?.click();
  };

  const handlePrivacyClick = () => {
    trackEvent('privacy-policy-opened', {
      timestamp: new Date().toISOString()
    });
    setIsPrivacyModalOpen(true);
  };

  const handleSupportClick = () => {
    trackEvent('support-opened', {
      timestamp: new Date().toISOString()
    });
    setIsSupportModalOpen(true);
  };

  // Compress image to reduce storage size
  const compressImage = (
    dataUrl: string,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = dataUrl;
    });
  };

  // Start generation directly without page navigation
  const startGenerationDirectly = async (imageDataUrl: string) => {
    console.log(
      "Starting generation directly with image length:",
      imageDataUrl.length
    );

    trackEvent('ai-generation-started', {
      imageSize: imageDataUrl.length,
      decades: DECADES.length,
      timestamp: new Date().toISOString()
    });

    // Initialize generation state
    const initialImages: Record<string, GeneratedImage> = {};
    DECADES.forEach((decade) => {
      initialImages[decade] = { status: "pending" };
    });
    setGeneratedImages(initialImages);
    setIsLoading(true);

    const concurrencyLimit = 2;
    const decadesQueue = [...DECADES];

    const processDecade = async (decade: string) => {
      console.log(`Starting generation for ${decade}...`);
      try {
        const prompt = `Reimagine the person in this photo in the style of the ${decade}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
        const resultUrl = await generateDecadeImage(imageDataUrl, prompt);
        console.log(
          `Successfully generated image for ${decade}, URL length:`,
          resultUrl.length
        );
        setGeneratedImages((prev) => {
          const newState = {
            ...prev,
            [decade]: { status: "done", url: resultUrl },
          };
          console.log(`Updated state for ${decade}:`, newState[decade]);
          return newState;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        console.error(`Failed to generate image for ${decade}:`, err);
        setGeneratedImages((prev) => ({
          ...prev,
          [decade]: { status: "error", error: errorMessage },
        }));
      }
    };

    const workers = Array(concurrencyLimit)
      .fill(null)
      .map(async () => {
        while (decadesQueue.length > 0) {
          const decade = decadesQueue.shift();
          if (decade) await processDecade(decade);
        }
      });

    await Promise.all(workers);
    setIsLoading(false);
    setAppState("results");
    
    trackEvent('ai-generation-completed', {
      totalDecades: DECADES.length,
      successfulGenerations: Object.values(generatedImages).filter(img => (img as GeneratedImage).status === 'done').length,
      timestamp: new Date().toISOString()
    });
  };

  // Handle payment redirects - moved after startGenerationDirectly function
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");

    console.log('Payment status check:', { paymentStatus, userAgent: navigator.userAgent });

    // Add a small delay on mobile to ensure page is fully loaded
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const delay = isMobileDevice ? 500 : 0;

    const processPaymentStatus = () => {
      if (paymentStatus === "cancelled") {
        trackEvent('payment-cancelled', {
          timestamp: new Date().toISOString()
        });
        
        // Try sessionStorage first, then localStorage as fallback
        let storedImage = sessionStorage.getItem("uploadedImage");
        if (!storedImage) {
          storedImage = localStorage.getItem("uploadedImage");
          console.log('Payment cancelled, image not in sessionStorage, checking localStorage:', !!storedImage);
        }
        
        console.log('Payment cancelled, stored image exists:', !!storedImage);
        if (storedImage) {
          setUploadedImage(storedImage);
          setAppState("image-uploaded");
        }
        window.history.replaceState(null, "", window.location.pathname);
      } else if (paymentStatus === "success") {
        // Handle successful payment - start generation
        trackEvent('payment-completed', {
          timestamp: new Date().toISOString()
        });
        
        // Try sessionStorage first, then localStorage as fallback
        let storedImage = sessionStorage.getItem("uploadedImage");
        if (!storedImage) {
          storedImage = localStorage.getItem("uploadedImage");
          console.log('Image not found in sessionStorage, checking localStorage:', !!storedImage);
        }
        
        console.log('Payment success, stored image exists:', !!storedImage, 'length:', storedImage?.length);
        
        if (storedImage) {
          console.log(
            "Payment successful, starting generation with image length:",
            storedImage.length
          );
          setAppState("generating");
          startGenerationDirectly(storedImage);
          // Clean up both storage locations
          sessionStorage.removeItem("uploadedImage");
          localStorage.removeItem("uploadedImage");
          // Clean up URL params
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          console.warn(
            "Payment success, but no image found. Redirecting to upload."
          );
          trackEvent('payment-success-no-image', {
            timestamp: new Date().toISOString()
          });
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    if (delay > 0) {
      setTimeout(processPaymentStatus, delay);
    } else {
      processPaymentStatus();
    }
  }, []);

  // Download individual image
  const handleDownloadIndividualImage = (decade: string) => {
    const image = generatedImages[decade];
    if (image?.status === "done" && image.url) {
      trackEvent('individual-download', {
        decade: decade,
        timestamp: new Date().toISOString()
      });
      const link = document.createElement("a");
      link.href = image.url;
      link.download = `past-yous-${decade}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download album
  const handleDownloadAlbum = async () => {
    try {
      trackEvent('album-download-initiated', {
        timestamp: new Date().toISOString()
      });
      
      const imageData = Object.entries(generatedImages)
        .filter(
          ([, image]) =>
            (image as GeneratedImage).status === "done" &&
            (image as GeneratedImage).url
        )
        .reduce(
          (acc, [decade, image]) => ({
            ...acc,
            [decade]: (image as GeneratedImage)!.url!,
          }),
          {} as Record<string, string>
        );

      if (Object.keys(imageData).length === 0) {
        trackEvent('album-download-failed', {
          reason: 'no-successful-images',
          timestamp: new Date().toISOString()
        });
        alert("No images were generated successfully. Cannot create an album.");
        return;
      }

      const albumDataUrl = await createAlbumPage(imageData);
      const link = document.createElement("a");
      link.href = albumDataUrl;
      link.download = "past-yous-album.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      trackEvent('album-download-success', {
        imageCount: Object.keys(imageData).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to create or download album:", error);
      trackEvent('album-download-error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      alert("Sorry, there was an error creating your album. Please try again.");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative isolate">
      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageUpload}
      />
      <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-8xl font-mono font-bold">
            Past Yous
          </h1>
          <p className="font-sans text-[var(--muted-foreground)] mt-2 text-xl tracking-wide">
            See yourself through the decades.
          </p>
        </div>

        {appState === "idle" && (
          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Hyperspeed background animation - only show when idle */}
            {appState === "idle" && (
              <div className="absolute inset-0 w-full h-full">
                <Hyperspeed
                  effectOptions={{
                    onSpeedUp: () => {},
                    onSlowDown: () => {},
                    distortion: "turbulentDistortion",
                    length: 400,
                    roadWidth: 10,
                    islandWidth: 2,
                    lanesPerRoad: 4,
                    fov: 90,
                    fovSpeedUp: 150,
                    speedUp: 2,
                    carLightsFade: 0.4,
                    totalSideLightSticks: 20,
                    lightPairsPerRoadWay: 40,
                    shoulderLinesWidthPercentage: 0.05,
                    brokenLinesWidthPercentage: 0.1,
                    brokenLinesLengthPercentage: 0.5,
                    lightStickWidth: [0.12, 0.5],
                    lightStickHeight: [1.3, 1.7],
                    movingAwaySpeed: [60, 80],
                    movingCloserSpeed: [-120, -160],
                    carLightsLength: [400 * 0.03, 400 * 0.2],
                    carLightsRadius: [0.05, 0.14],
                    carWidthPercentage: [0.3, 0.5],
                    carShiftX: [-0.8, 0.8],
                    carFloorSeparation: [0, 5],
                  }}
                />
              </div>
            )}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex flex-col items-center w-full max-w-4xl relative z-10"
            >
              <div className="mb-20 text-center">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer group transform hover:scale-105 transition-transform duration-300 inline-block"
                >
                  <PolaroidCard caption="Click to Upload" status="done" />
                </label>
              </div>

              <div className="text-center max-w-2xl mx-auto mt-8">
                <h2 className="text-4xl font-mono font-bold tracking-tight">
                  Travel Through Time
                </h2>
                <p className="mt-4 text-lg text-[var(--muted-foreground)]">
                  Ever wondered what you'd look like in a different era? Upload
                  a single photo, and our AI will reimagine you in the iconic
                  styles of past decades.
                </p>
              </div>

              <div className="mt-12 w-full">
                <RollingGallery />
              </div>
            </motion.div>
          </div>
        )}

        {appState === "image-uploaded" && uploadedImage && (
          <div className="flex flex-col items-center gap-6 relative z-20">
            <PolaroidCard
              imageUrl={uploadedImage}
              caption="Your Photo"
              status="done"
              onChangeImage={handleChangeImageClick}
            />
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handlePaymentClick}
                disabled={isPaying}
                className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPaying ? "Processing Payment..." : "Generate Images - $2.00"}
              </button>
            </div>
          </div>
        )}

        {appState === "generating" && (
          <div className="flex flex-col items-center gap-6 relative z-20">
            <div className="text-center">
              <h2 className="text-4xl font-mono font-bold mb-4">
                Generating Your Past Yous...
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                This may take a few minutes
              </p>
            </div>
            {isMobile ? (
              <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-4 p-4">
                {DECADES.map((decade) => (
                  <div key={decade} className="flex justify-center">
                    <PolaroidCard
                      caption={decade}
                      status={generatedImages[decade]?.status || "pending"}
                      imageUrl={generatedImages[decade]?.url}
                      error={generatedImages[decade]?.error}
                      onDownload={handleDownloadIndividualImage}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
                {DECADES.map((decade) => (
                  <PolaroidCard
                    key={decade}
                    caption={decade}
                    status={generatedImages[decade]?.status || "pending"}
                    imageUrl={generatedImages[decade]?.url}
                    error={generatedImages[decade]?.error}
                    onDownload={handleDownloadIndividualImage}
                    isMobile={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {appState === "results" && (
          <div className="flex flex-col items-center gap-6 relative z-20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-mono font-bold mb-4">
                Your Past Yous
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Your journey through time
              </p>
            </div>
            {isMobile ? (
              <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-4 p-4">
                {DECADES.map((decade) => (
                  <div key={decade} className="flex justify-center">
                    <PolaroidCard
                      caption={decade}
                      status={generatedImages[decade]?.status || "pending"}
                      imageUrl={generatedImages[decade]?.url}
                      error={generatedImages[decade]?.error}
                      onDownload={handleDownloadIndividualImage}
                      isMobile={isMobile}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl">
                {DECADES.map((decade) => (
                  <PolaroidCard
                    key={decade}
                    caption={decade}
                    status={generatedImages[decade]?.status || "pending"}
                    imageUrl={generatedImages[decade]?.url}
                    error={generatedImages[decade]?.error}
                    onDownload={handleDownloadIndividualImage}
                    isMobile={false}
                  />
                ))}
              </div>
            )}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleDownloadAlbum}
                className={primaryButtonClasses}
              >
                Download Album
              </button>
              <button
                onClick={() => {
                  trackEvent('start-over-clicked', {
                    timestamp: new Date().toISOString()
                  });
                  setAppState("idle");
                }}
                className={secondaryButtonClasses}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer 
        onPrivacyClick={handlePrivacyClick}
        onSupportClick={handleSupportClick}
      />
      
      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </main>
  );
};

// --- Results Page Component ---
const ResultsPage = () => {
  const [generatedImages, setGeneratedImages] = useState<
    Record<string, GeneratedImage>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isGenerationStarted, setIsGenerationStarted] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    console.log(
      "ResultsPage useEffect running, isGenerationStarted:",
      isGenerationStarted
    );
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const imageParam = urlParams.get("image");
    console.log("Payment status:", paymentStatus);
    console.log("Image param found:", !!imageParam);

    if (paymentStatus === "success" && !isGenerationStarted) {
      let imageData = null;
      const fallback = urlParams.get("fallback") === "true";

      if (fallback) {
        // Try to get image from global variable (fallback method)
        imageData = (window as any).tempUploadedImage;
        console.log("Using fallback method, image found:", !!imageData);
        if (imageData) {
          // Clean up the global variable
          delete (window as any).tempUploadedImage;
        }
      } else {
        // Try to get image from sessionStorage
        imageData = sessionStorage.getItem("uploadedImage");
        console.log("Using sessionStorage, image found:", !!imageData);
      }

      if (imageData) {
        console.log("Starting generation with image length:", imageData.length);
        setIsGenerationStarted(true);
        startGeneration(imageData);
        // Clean up sessionStorage if it was used
        sessionStorage.removeItem("uploadedImage");
        // Clean up URL params
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?page=results`
        );
      } else {
        console.warn(
          "Payment success, but no image found. Redirecting to home."
        );
        window.location.href = "/";
      }
    } else if (!paymentStatus && !isGenerationStarted) {
      // If someone lands here directly without payment, check for a stored image
      const storedImage = sessionStorage.getItem("uploadedImage");
      console.log("No payment status, stored image found:", !!storedImage);
      if (!storedImage) {
        console.log("No image found, redirecting home.");
        window.location.href = "/";
      } else {
        // This case should not be hit in normal flow, but as a fallback:
        console.log("Fallback: Starting generation...");
        setIsGenerationStarted(true);
        startGeneration(storedImage);
        sessionStorage.removeItem("uploadedImage");
      }
    }
  }, [isGenerationStarted]);

  const startGeneration = async (imageDataUrl: string) => {
    console.log(
      "startGeneration called with imageDataUrl length:",
      imageDataUrl.length
    );
    setIsLoading(true);
    const initialImages: Record<string, GeneratedImage> = {};
    DECADES.forEach((decade) => {
      initialImages[decade] = { status: "pending" };
    });
    console.log("Setting initial images:", initialImages);
    setGeneratedImages(initialImages);

    const concurrencyLimit = 2;
    const decadesQueue = [...DECADES];

    const processDecade = async (decade: string) => {
      console.log(`Starting generation for ${decade}...`);
      try {
        const prompt = `Reimagine the person in this photo in the style of the ${decade}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
        const resultUrl = await generateDecadeImage(imageDataUrl, prompt);
        console.log(
          `Successfully generated image for ${decade}, URL length:`,
          resultUrl.length
        );
        setGeneratedImages((prev) => {
          const newState = {
            ...prev,
            [decade]: { status: "done", url: resultUrl },
          };
          console.log(`Updated state for ${decade}:`, newState[decade]);
          return newState;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        console.error(`Failed to generate image for ${decade}:`, err);
        setGeneratedImages((prev) => ({
          ...prev,
          [decade]: { status: "error", error: errorMessage },
        }));
      }
    };

    const workers = Array(concurrencyLimit)
      .fill(null)
      .map(async () => {
        while (decadesQueue.length > 0) {
          const decade = decadesQueue.shift();
          if (decade) await processDecade(decade);
        }
      });

    await Promise.all(workers);
    setIsLoading(false);
  };

  const handleReset = () => {
    sessionStorage.removeItem("uploadedImage");
    // Clean up global variable if it exists
    delete (window as any).tempUploadedImage;

    // Navigate back to landing page without full reload
    const url = new URL(window.location.href);
    url.searchParams.delete("page");
    url.searchParams.delete("payment");
    url.searchParams.delete("fallback");
    window.history.pushState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handlePrivacyClick = () => {
    trackEvent('privacy-policy-opened', {
      timestamp: new Date().toISOString()
    });
    setIsPrivacyModalOpen(true);
  };

  const handleSupportClick = () => {
    trackEvent('support-opened', {
      timestamp: new Date().toISOString()
    });
    setIsSupportModalOpen(true);
  };

  const handleDownloadIndividualImage = (decade: string) => {
    const image = generatedImages[decade];
    if (image?.status === "done" && image.url) {
      const link = document.createElement("a");
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
        .filter(
          ([, image]) =>
            (image as GeneratedImage).status === "done" &&
            (image as GeneratedImage).url
        )
        .reduce(
          (acc, [decade, image]) => ({
            ...acc,
            [decade]: (image as GeneratedImage)!.url!,
          }),
          {} as Record<string, string>
        );

      if (Object.keys(imageData).length === 0) {
        alert("No images were generated successfully. Cannot create an album.");
        return;
      }

      const albumDataUrl = await createAlbumPage(imageData);
      const link = document.createElement("a");
      link.href = albumDataUrl;
      link.download = "past-yous-album.jpg";
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

  const allDone =
    Object.values(generatedImages).every(
      (img) => (img as GeneratedImage).status !== "pending"
    ) && Object.keys(generatedImages).length > 0;

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative isolate">
      <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-8xl font-mono font-bold">
            Past Yous
          </h1>
          <p className="font-sans text-[var(--muted-foreground)] mt-2 text-xl tracking-wide">
            Your journey through time.
          </p>
        </div>
        {isMobile ? (
          <div className="w-full max-w-sm flex-1 overflow-y-auto mt-4 space-y-4 p-4">
            {DECADES.map((decade) => (
              <div key={decade} className="flex justify-center">
                <PolaroidCard
                  caption={decade}
                  status={generatedImages[decade]?.status || "pending"}
                  imageUrl={generatedImages[decade]?.url}
                  error={generatedImages[decade]?.error}
                  onDownload={handleDownloadIndividualImage}
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mt-4">
            {DECADES.map((decade) => {
              const imageStatus = generatedImages[decade]?.status || "pending";
              const hasImage = generatedImages[decade]?.url;

              console.log(`Rendering ${decade}:`, {
                status: imageStatus,
                hasImage: !!hasImage,
              });

              return (
                <PolaroidCard
                  key={`${decade}-${imageStatus}`}
                  caption={decade}
                  status={imageStatus}
                  imageUrl={hasImage}
                  error={generatedImages[decade]?.error}
                  onDownload={handleDownloadIndividualImage}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        )}
        <div className="h-20 mt-4 flex items-center justify-center">
          {allDone && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleDownloadAlbum}
                disabled={isDownloading}
                className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isDownloading ? "Creating Album..." : "Download Album"}
              </button>
              <button onClick={handleReset} className={secondaryButtonClasses}>
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer 
        onPrivacyClick={handlePrivacyClick}
        onSupportClick={handleSupportClick}
      />
      
      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </main>
  );
};

// --- Main App Router ---
function App() {
  return <LandingPage />;
}

export default App;
