/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { DraggableCardContainer, DraggableCardBody } from './ui/draggable-card';
import { cn } from '../lib/utils';

type ImageStatus = 'pending' | 'done' | 'error';

interface PolaroidCardProps {
    imageUrl?: string;
    caption: string;
    status: ImageStatus;
    error?: string;
    dragConstraintsRef?: React.RefObject<HTMLElement>;
    onDownload?: (caption: string) => void;
    onChangeImage?: () => void;
    isMobile?: boolean;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-8 w-8 text-[var(--muted-foreground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const ErrorDisplay = () => (
    <div className="flex items-center justify-center h-full">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>
);

const Placeholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-mono text-xl">Upload Photo</span>
    </div>
);


const PolaroidCard: React.FC<PolaroidCardProps> = ({ imageUrl, caption, status, error, dragConstraintsRef, onDownload, onChangeImage, isMobile }) => {
    // The "developing" animation is only for AI-generated images, not the user's initial upload.
    // The user upload card is identified by having an `onChangeImage` handler.
    const isUserUploadCard = !!onChangeImage;

    // `isDeveloped` controls the visual animation. For the user's card, it's always true.
    // For generated cards, it starts false to allow the animation to run.
    const [isDeveloped, setIsDeveloped] = useState(isUserUploadCard);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // This effect manages the state for the developing animation.
    useEffect(() => {
        // For the user's card, we only need to reset the loaded flag when the image changes.
        if (isUserUploadCard) {
            setIsImageLoaded(false);
            return;
        }

        // For AI-generated cards, we reset the animation states when they are pending
        // or when a new image URL is provided, to allow the animation to re-run.
        if ((status === 'pending') || (status === 'done' && imageUrl)) {
            setIsDeveloped(false);
            setIsImageLoaded(false);
        }
    }, [imageUrl, status, isUserUploadCard]);

    // This effect triggers the "developing" animation for generated cards once they've loaded.
    useEffect(() => {
        if (isImageLoaded && !isUserUploadCard) {
            const timer = setTimeout(() => {
                setIsDeveloped(true);
            }, 200); // Short delay before animation starts
            return () => clearTimeout(timer);
        }
    }, [isImageLoaded, isUserUploadCard]);


    const cardInnerContent = (
        <>
            <div className="w-full bg-black shadow-inner flex-grow relative overflow-hidden group">
                {status === 'pending' && <LoadingSpinner />}
                {status === 'error' && <ErrorDisplay />}
                {status === 'done' && imageUrl && (
                    <>
                         {/* Download Button (top right) */}
                        <div className={cn(
                            "absolute top-2 right-2 z-20 flex flex-col gap-2 transition-opacity duration-300",
                            !isMobile && "opacity-0 group-hover:opacity-100",
                        )}>
                            {onDownload && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent drag from starting on click
                                        onDownload(caption);
                                    }}
                                    className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label={`Download image for ${caption}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Change Image Button (bottom right) */}
                        {onChangeImage && (
                            <div className={cn(
                                "absolute bottom-2 right-2 z-20 transition-opacity duration-300",
                                !isMobile && "opacity-0 group-hover:opacity-100",
                            )}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeImage();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 rounded-full text-white text-xs font-mono hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Change image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-5.26M20 15a9 9 0 01-14.13 5.26" />
                                    </svg>
                                    <span>Change</span>
                                </button>
                            </div>
                        )}

                        {/* The developing chemical overlay - only shown for generated cards */}
                        {!isUserUploadCard && (
                            <div
                                className={`absolute inset-0 z-10 bg-[var(--foreground)] transition-opacity duration-[3500ms] ease-out ${
                                    isDeveloped ? 'opacity-0' : 'opacity-100'
                                }`}
                                aria-hidden="true"
                            />
                        )}
                        
                        {/* The Image */}
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={caption}
                            onLoad={() => setIsImageLoaded(true)}
                            className={cn(
                                'w-full h-full object-cover',
                                // User's photo gets a quick fade, generated photos get the slow "developing" effect.
                                isUserUploadCard
                                    ? 'transition-opacity duration-300'
                                    : 'transition-all duration-[4000ms] ease-in-out',
                                // Visual styles for the "developing" animation.
                                isDeveloped
                                    ? 'opacity-100 filter-none'
                                    : 'opacity-80 filter sepia(1) contrast(0.8) brightness(0.8)'
                            )}
                            style={{ opacity: isImageLoaded ? 1 : 0 }}
                        />
                    </>
                )}
                {status === 'done' && !imageUrl && <Placeholder />}
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center px-2">
                <p className={cn(
                    "font-mono text-lg truncate",
                    "text-[var(--card-foreground)]"
                )}>
                    {caption}
                </p>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <div className="bg-[var(--card)] !p-4 !pb-16 flex flex-col items-center justify-start aspect-[3/4] w-80 max-w-full rounded-md shadow-xl relative transition-transform duration-200 hover:scale-105">
                {cardInnerContent}
            </div>
        );
    }

    return (
        <DraggableCardContainer>
            <DraggableCardBody 
                className="bg-[var(--card)] !p-4 !pb-16 flex flex-col items-center justify-start aspect-[3/4] w-80 max-w-full"
                dragConstraintsRef={dragConstraintsRef}
            >
                {cardInnerContent}
            </DraggableCardBody>
        </DraggableCardContainer>
    );
};

export default PolaroidCard;