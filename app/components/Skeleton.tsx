"use client";

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'project';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
    card: "rounded-lg",
    project: "rounded-lg"
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Skeleton específico para tarjetas de proyecto
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={24} className="mb-2" />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="text" width="100%" height={16} className="mb-2" />
      <Skeleton variant="text" width="80%" height={16} className="mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
        <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="rectangular" width={80} height={32} className="rounded" />
      </div>
    </div>
  );
}

// Skeleton para grid de proyectos
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para estadísticas
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center">
            <Skeleton variant="circular" width={48} height={48} className="mr-4" />
            <div className="flex-1">
              <Skeleton variant="text" width="60%" height={16} className="mb-2" />
              <Skeleton variant="text" width="40%" height={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para lista de organizaciones
export function OrganizationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={64} height={64} />
            <div className="flex-1">
              <Skeleton variant="text" width="40%" height={20} className="mb-2" />
              <Skeleton variant="text" width="60%" height={16} className="mb-1" />
              <Skeleton variant="text" width="50%" height={16} />
            </div>
            <Skeleton variant="rectangular" width={100} height={36} className="rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

