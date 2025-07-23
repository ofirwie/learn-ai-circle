import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';
import { sessionService } from '@/services/sessionService';

export const usePageTracking = (pageTitle?: string) => {
  const location = useLocation();
  const previousLocationRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Only track if the path has actually changed
    if (previousLocationRef.current !== currentPath) {
      // Track page view
      const title = pageTitle || document.title || 'Unknown Page';
      
      analyticsService.logPageView(currentPath, title);
      sessionService.trackPageView(currentPath, title);
      
      // Update document title if provided
      if (pageTitle && document.title !== pageTitle) {
        document.title = pageTitle;
      }
      
      previousLocationRef.current = currentPath;
    }
  }, [location.pathname, location.search, pageTitle]);

  // Return utility functions for manual tracking
  return {
    trackEvent: analyticsService.logEvent.bind(analyticsService),
    trackButtonClick: analyticsService.logButtonClick.bind(analyticsService),
    trackSearch: analyticsService.logSearch.bind(analyticsService),
    trackTimeSpent: analyticsService.logTimeSpent.bind(analyticsService),
    trackError: analyticsService.logError.bind(analyticsService)
  };
};

// Hook for tracking specific interactions
export const useInteractionTracking = () => {
  const trackButtonClick = (buttonName: string, context?: string) => {
    analyticsService.logButtonClick(buttonName, context);
    sessionService.trackInteraction('button_click', buttonName);
  };

  const trackFormSubmit = (formName: string, success: boolean, error?: string) => {
    analyticsService.logEvent({
      event_type: 'form_submit',
      target_type: 'form',
      target_id: formName,
      metadata: { success, error }
    });
    sessionService.trackInteraction('form_submit', formName);
  };

  const trackContentEngagement = (contentType: string, contentId: string, engagementType: string, value?: number) => {
    analyticsService.logEvent({
      event_type: 'content_engagement',
      target_type: contentType,
      target_id: contentId,
      metadata: { engagement_type: engagementType, value }
    });
    sessionService.trackInteraction('content_engagement', contentId);
  };

  const trackDownload = (fileName: string, fileType: string) => {
    analyticsService.logEvent({
      event_type: 'file_download',
      target_type: 'file',
      target_id: fileName,
      metadata: { file_type: fileType }
    });
    sessionService.trackInteraction('file_download', fileName);
  };

  const trackVideoPlay = (videoId: string, videoTitle?: string) => {
    analyticsService.logEvent({
      event_type: 'video_play',
      target_type: 'video',
      target_id: videoId,
      metadata: { video_title: videoTitle }
    });
    sessionService.trackInteraction('video_play', videoId);
  };

  const trackSearchQuery = (query: string, resultsCount: number, filters?: any) => {
    analyticsService.logSearch(query, resultsCount);
    analyticsService.logEvent({
      event_type: 'search_performed',
      target_type: 'search',
      target_id: query,
      metadata: { results_count: resultsCount, filters }
    });
    sessionService.trackInteraction('search', query);
  };

  return {
    trackButtonClick,
    trackFormSubmit,
    trackContentEngagement,
    trackDownload,
    trackVideoPlay,
    trackSearchQuery
  };
};

// Hook for measuring time spent on content
export const useTimeTracking = (contentType: string, contentId: string, threshold: number = 30) => {
  const startTimeRef = useRef<number>(Date.now());
  const trackedRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    trackedRef.current = false;

    const handleVisibilityChange = () => {
      if (document.hidden && !trackedRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= threshold) {
          analyticsService.logTimeSpent(contentType, contentId, timeSpent);
          trackedRef.current = true;
        }
      } else if (!document.hidden) {
        startTimeRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      if (!trackedRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= threshold) {
          analyticsService.logTimeSpent(contentType, contentId, timeSpent);
          trackedRef.current = true;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Track time when component unmounts
      if (!trackedRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= threshold) {
          analyticsService.logTimeSpent(contentType, contentId, timeSpent);
        }
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [contentType, contentId, threshold]);

  return {
    markEngagement: () => {
      if (!trackedRef.current) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        analyticsService.logTimeSpent(contentType, contentId, timeSpent);
        trackedRef.current = true;
      }
    },
    resetTimer: () => {
      startTimeRef.current = Date.now();
      trackedRef.current = false;
    }
  };
};

export default usePageTracking;