import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const baseClasses = 'bg-slate-200 animate-pulse';

  const variantClasses = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded-sm h-4 w-full',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full flex flex-col">
    <Skeleton variant="rect" className="w-full aspect-square" />
    <div className="p-4 flex-grow space-y-3">
      <Skeleton variant="text" className="w-3/4 h-5" />
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-20 h-6" />
          <Skeleton variant="text" className="w-16 h-4" />
        </div>
        <Skeleton variant="rect" className="w-10 h-10 rounded-xl" />
      </div>
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="relative group rounded-2xl overflow-hidden aspect-[4/5] bg-white border border-slate-100">
    <Skeleton variant="rect" className="w-full h-full" />
    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
      <Skeleton variant="text" className="w-2/3 h-5" />
      <Skeleton variant="text" className="w-full h-3" />
    </div>
  </div>
);

export const VideoSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 h-full">
    <Skeleton variant="rect" className="w-full aspect-[9/16]" />
    <div className="p-3 space-y-2">
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  </div>
);

export const HeroSkeleton = ({ isMobile }) => (
  <div className="w-full h-[200px] md:h-[250px] rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4">
    <Skeleton variant="rect" className="w-full h-full rounded-2xl" />
    {!isMobile && <Skeleton variant="rect" className="w-full h-full rounded-2xl" />}
  </div>
);

export const CircleSkeleton = ({ className = '' }) => (
  <div className={`flex flex-col items-center text-center ${className}`}>
    <Skeleton variant="circle" className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 shadow-sm" />
    <Skeleton variant="text" className="mt-2 w-16 h-4" />
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Image Gallery Skeleton */}
      <div className="w-full lg:w-1/2 space-y-4">
        <Skeleton variant="rect" className="w-full aspect-square rounded-2xl" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-20 h-20 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="w-full lg:w-1/2 space-y-6">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <Skeleton variant="text" className="w-3/4 h-8" />
          <Skeleton variant="text" className="w-1/2 h-6" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton variant="text" className="w-24 h-8" />
          <Skeleton variant="text" className="w-20 h-6" />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Skeleton variant="text" className="w-full h-20" />
        </div>

        <div className="flex gap-4 pt-6">
          <Skeleton variant="rect" className="flex-1 h-14 rounded-xl" />
          <Skeleton variant="rect" className="w-14 h-14 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

export const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-48 h-6" />
      </div>
      <Skeleton variant="rect" className="w-24 h-8 rounded-full" />
    </div>
    <div className="flex gap-4 pt-4 border-t border-slate-50">
      <Skeleton variant="rect" className="w-20 h-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/4 h-4" />
      </div>
    </div>
    <div className="flex justify-between items-center pt-4">
      <Skeleton variant="text" className="w-24 h-6" />
      <Skeleton variant="rect" className="w-32 h-10 rounded-xl" />
    </div>
  </div>
);

export const BlogSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
    <Skeleton variant="rect" className="w-full h-48 md:h-56" />
    <div className="p-6 space-y-4">
      <div className="flex gap-4">
        <Skeleton variant="text" className="w-24 h-4" />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-full h-12" />
      <Skeleton variant="text" className="w-20 h-4" />
    </div>
  </div>
);

export const BlogPostSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8 animate-pulse">
    <div className="max-w-4xl mx-auto space-y-8">
      <Skeleton variant="rect" className="w-full h-[400px] rounded-3xl" />
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-24 h-4" />
        </div>
        <Skeleton variant="text" className="w-full h-10" />
        <Skeleton variant="text" className="w-2/3 h-10" />
      </div>
      <div className="space-y-6 pt-8 border-t border-slate-100">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
      </div>
    </div>
  </div>
);

export const VenueSkeleton = () => (
  <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
    <Skeleton variant="rect" className="aspect-[16/10] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="w-3/4 h-6" />
      <Skeleton variant="text" className="w-1/2 h-4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-24 h-6" />
        <Skeleton variant="rect" className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export const VenueDetailSkeleton = () => (
  <div className="min-h-screen bg-slate-50 py-8 animate-pulse">
    <div className="container mx-auto px-4 space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5 space-y-4">
          <Skeleton variant="rect" className="w-full aspect-video rounded-3xl" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rect" className="w-20 h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="w-full lg:w-2/5 space-y-6">
          <div className="space-y-4">
            <Skeleton variant="text" className="w-1/4 h-6 rounded-full" />
            <Skeleton variant="text" className="w-3/4 h-10" />
            <Skeleton variant="text" className="w-1/2 h-6" />
          </div>
          <div className="flex gap-8 pt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="text" className="w-12 h-8" />
                <Skeleton variant="text" className="w-16 h-4" />
              </div>
            ))}
          </div>
          <div className="space-y-4 pt-8 border-t border-slate-100">
            <Skeleton variant="rect" className="w-full h-14 rounded-2xl" />
            <Skeleton variant="rect" className="w-full h-14 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center mb-6">
      <Skeleton variant="text" className="w-48 h-8" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-full h-10" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
