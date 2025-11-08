import React from 'react';
import { motion } from 'framer-motion';

interface BounceCardProps {
  imageUrl: string;
  caption: string;
  index: number;
  total: number;
}

const BounceCard: React.FC<BounceCardProps> = ({ imageUrl, caption, index, total }) => {
  const rotation = (index - (total - 1) / 2) * 8; // Fan out rotation
  const spacing = 80; // Spacing between cards in pixels
  const centerOffset = (index - (total - 1) / 2) * spacing; // Offset from center
  const zIndex = total - index; // Front cards have higher z-index
  
  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${centerOffset}px)`,
        top: '20%',
        transform: 'translate(-50%, -50%)',
        zIndex: zIndex,
        transformOrigin: 'center center',
      }}
      initial={{ 
        rotate: rotation,
        scale: 0.8,
        opacity: 0,
        y: 50
      }}
      animate={{ 
        rotate: rotation,
        scale: 1,
        opacity: 1,
        y: 0
      }}
      whileHover={{ 
        scale: 1.1,
        rotate: rotation + 5,
        zIndex: total + 1,
        transition: { duration: 0.3 }
      }}
      transition={{ 
        delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 
      }}
    >
      <div className="relative w-48 h-64 md:w-64 md:h-80 bg-white rounded-lg p-2 shadow-2xl border-2 border-white/20">
        {/* Image container */}
        <div className="w-full h-full rounded overflow-hidden bg-black">
          <img 
            src={imageUrl} 
            alt={caption}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
        
        {/* Caption */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="font-mono text-xs md:text-sm font-bold text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            {caption}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface BounceCardsProps {
  images: Array<{ url: string; caption: string }>;
}

const BounceCards: React.FC<BounceCardsProps> = ({ images }) => {
  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[450px] overflow-visible">
      {images.map((image, index) => (
        <BounceCard
          key={index}
          imageUrl={image.url}
          caption={image.caption}
          index={index}
          total={images.length}
        />
      ))}
    </div>
  );
};

export default BounceCards;
