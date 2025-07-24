import { supabase } from '../services/supabase';

export interface ThumbnailOptions {
  featured_image?: string;
  youtube_video_id?: string;
  brand_logo?: string;
  category?: string;
  tags?: string[];
}

// Cache for brand logos to avoid repeated queries
const brandLogoCache = new Map<string, string>();

/**
 * Get smart thumbnail URL based on priority:
 * 1. Featured image (if exists)
 * 2. YouTube video thumbnail (if video_id exists)
 * 3. Brand logo (if news category and brand is mentioned)
 * 4. Category-specific placeholder
 */
export async function getSmartThumbnail(options: ThumbnailOptions): Promise<string> {
  const { featured_image, youtube_video_id, brand_logo, category, tags = [] } = options;

  // Priority 1: Featured image
  if (featured_image) {
    return featured_image;
  }

  // Priority 2: YouTube thumbnail
  if (youtube_video_id) {
    return `https://img.youtube.com/vi/${youtube_video_id}/mqdefault.jpg`;
  }

  // Priority 3: Brand logo (for news articles)
  if (category?.toLowerCase() === 'news' || tags.includes('news')) {
    // Check if we have a specific brand logo
    if (brand_logo) {
      return brand_logo;
    }

    // Try to detect brand from title or tags
    const brandKeywords = ['openai', 'google', 'microsoft', 'meta', 'anthropic', 'tesla', 'nvidia', 'apple'];
    const detectedBrand = brandKeywords.find(brand => 
      tags.some(tag => tag.toLowerCase().includes(brand)) ||
      options.featured_image?.toLowerCase().includes(brand)
    );

    if (detectedBrand) {
      const logo = await getBrandLogo(detectedBrand);
      if (logo) return logo;
    }
  }

  // Priority 4: Category-specific placeholder
  return getCategoryPlaceholder(category || 'article');
}

/**
 * Get brand logo from database with caching
 */
async function getBrandLogo(brandName: string): Promise<string | null> {
  // Check cache first
  if (brandLogoCache.has(brandName)) {
    return brandLogoCache.get(brandName)!;
  }

  try {
    const { data, error } = await supabase
      .from('brand_logos')
      .select('logo_url')
      .eq('name', brandName.toLowerCase())
      .single();

    if (!error && data?.logo_url) {
      brandLogoCache.set(brandName, data.logo_url);
      return data.logo_url;
    }
  } catch (error) {
    console.error('Error fetching brand logo:', error);
  }

  return null;
}

/**
 * Generate category-specific placeholder SVG
 */
export function getCategoryPlaceholder(category: string): string {
  const categoryUpper = category.toUpperCase();
  const categoryColors: Record<string, { bg: string; fg: string }> = {
    'NEWS': { bg: '#EF4444', fg: '#FFFFFF' },
    'GUIDE': { bg: '#10B981', fg: '#FFFFFF' },
    'TOOL-REVIEW': { bg: '#3B82F6', fg: '#FFFFFF' },
    'AI': { bg: '#8B5CF6', fg: '#FFFFFF' },
    'ARTICLE': { bg: '#6B7280', fg: '#FFFFFF' }
  };

  const colors = categoryColors[categoryUpper] || categoryColors['ARTICLE'];
  
  return `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="${colors.bg}"/>
    <circle cx="160" cy="90" r="40" fill="${colors.fg}" opacity="0.2"/>
    <text x="160" y="95" text-anchor="middle" fill="${colors.fg}" font-size="16" font-family="Arial, sans-serif" font-weight="bold">${categoryUpper}</text>
    <path d="M145 75L175 90L145 105V75Z" fill="${colors.fg}" opacity="0.4"/>
  </svg>`)}`;
}

/**
 * Generate error placeholder SVG
 */
export function getErrorPlaceholder(): string {
  return `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#F3F4F6"/>
    <circle cx="160" cy="90" r="30" fill="#9CA3AF"/>
    <text x="160" y="120" text-anchor="middle" fill="#4B5563" font-size="12" font-family="Arial">NO IMAGE</text>
    <path d="M145 75L175 90L145 105V75Z" fill="#F9FAFB"/>
  </svg>`)}`;
}