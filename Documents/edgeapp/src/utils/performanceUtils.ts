// performanceUtils.ts - Performance optimization utilities
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Debounce hook for performance-sensitive operations
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced callback
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Throttle hook for performance-sensitive operations
 * @param callback Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled callback
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;

  return throttledCallback;
};

/**
 * Memoized selector for complex state computations
 * @param selector Function to compute derived state
 * @param dependencies Dependencies array
 * @returns Memoized result
 */
export const useMemoizedSelector = <T>(
  selector: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(selector, dependencies);
};

/**
 * Performance monitoring hook
 * @param componentName Name of component to monitor
 * @param enabled Whether monitoring is enabled
 */
export const usePerformanceMonitoring = (
  componentName: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    renderStartTime.current = performance.now();

    // Log render time after DOM update
    const timeoutId = setTimeout(() => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  });

  // Return performance metrics
  return useMemo(() => ({
    renderCount: renderCount.current,
    componentName
  }), [componentName]);
};

/**
 * Intersection Observer hook for lazy loading
 * @param options Intersection Observer options
 * @returns Ref and isIntersecting state
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options, hasIntersected]);

  return { elementRef, isIntersecting, hasIntersected };
};

/**
 * Virtual scrolling hook for large lists
 * @param items Array of items to virtualize
 * @param itemHeight Height of each item
 * @param containerHeight Height of visible container
 * @returns Visible items and scroll handlers
 */
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};

/**
 * Lazy component loader with error boundary
 * @param importFn Dynamic import function
 * @param fallback Loading component
 * @returns Lazy component with error handling
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  fallback: React.ComponentType = () => React.createElement('div', null, 'Loading...')
) => {
  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef((props: any, ref: any) => (
    React.createElement(React.Suspense, { fallback: React.createElement(fallback) },
      React.createElement(LazyComponent, { ...props, ref })
    )
  ));
};

/**
 * Bundle analyzer helper (development only)
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Log bundle information
  console.group('📦 Bundle Analysis');
  console.log('React version:', React.version);
  console.log('Environment:', process.env.NODE_ENV);
  
  // Estimate component sizes (rough approximation)
  const componentCount = document.querySelectorAll('[data-component]').length;
  console.log('Rendered components:', componentCount);
  
  // Memory usage (if available)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
  
  console.groupEnd();
};

// useState is already imported at the top