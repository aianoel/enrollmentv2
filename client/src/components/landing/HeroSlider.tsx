import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { Button } from '../ui/button';
import { HeroImage } from '../../hooks/useLandingPageData';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HeroSliderProps {
  images: HeroImage[];
  onLoginClick: () => void;
  onEnrollmentClick: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ 
  images, 
  onLoginClick, 
  onEnrollmentClick 
}) => {
  if (images.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 min-h-[600px] flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your School <span className="text-primary">Smarter</span>.<br />
            Learn Anywhere, Anytime.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A complete digital platform for students, teachers, parents, and administrators — powered by real-time technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onLoginClick} className="px-8 py-3">
              Login to Portal
            </Button>
            <Button size="lg" variant="outline" onClick={onEnrollmentClick} className="px-8 py-3">
              Enroll Now
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div 
              className="relative h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${image.url})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Manage Your School <span className="text-primary-300">Smarter</span>.<br />
                    Learn Anywhere, Anytime.
                  </h1>
                  <p className="text-xl mb-8 max-w-3xl mx-auto">
                    A complete digital platform for students, teachers, parents, and administrators — powered by real-time technology.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={onLoginClick} className="px-8 py-3">
                      Login to Portal
                    </Button>
                    <Button size="lg" variant="outline" onClick={onEnrollmentClick} className="px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20">
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};