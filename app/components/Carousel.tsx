"use client"; // Add this line to mark it as a Client Component

import Link from "next/link";
import { useState, useEffect } from "react";

interface CarouselProps {
  images: string[]; // Array of image URLs
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const slideIntervalTime = 3000; // Time in milliseconds (3 seconds)

  // Automatically change slides every few seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      goToNextSlide();
    }, slideIntervalTime);

    // Clean up the interval when component unmounts
    return () => clearInterval(slideInterval);
  }, [currentIndex]);

  const goToNextSlide = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToPreviousSlide = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full h-fit overflow-hidden rounded-[20px]">
      {/* Left arrow */}
      <button
        className="absolute top-1/2 transform -translate-y-1/2 left-2 text-white hover:text-black p-0 text-2xl z-10"
        onClick={goToPreviousSlide}
      >
        &#10094;
      </button>

      {/* Carousel images */}
      <Link href="/menu/deals-of-the-week"
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="min-w-full h-[150px] bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </Link>

      {/* Right arrow */}
      <button
        className="absolute top-1/2 transform -translate-y-1/2 right-2 text-white hover:text-black p-0 text-2xl z-10"
        onClick={goToNextSlide}
      >
        &#10095;
      </button>
    </div>
  );
};

export default Carousel;
