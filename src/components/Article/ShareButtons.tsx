import React, { useState } from 'react';
import { Article } from '../../types/content';
import { PDFExportService } from '../../services/pdfExportService';

interface ShareButtonsProps {
  article: Article;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ article }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleWhatsAppShare = () => {
    PDFExportService.shareOnWhatsApp(article);
  };

  const handlePDFExport = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      await PDFExportService.exportArticleToPDF(article);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await PDFExportService.copyArticleLink(article);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      alert('Failed to copy link to clipboard');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginRight: '8px'
      }}>
        Share:
      </span>

      {/* WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: '#25D366',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#128C7E';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#25D366';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '16px' }}>📱</span>
        WhatsApp
      </button>

      {/* PDF Export Button */}
      <button
        onClick={handlePDFExport}
        disabled={isExporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: isExporting ? '#9ca3af' : '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isExporting ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isExporting) {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExporting) {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>
          {isExporting ? '⏳' : '📄'}
        </span>
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: linkCopied ? '#059669' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!linkCopied) {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!linkCopied) {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>
          {linkCopied ? '✅' : '🔗'}
        </span>
        {linkCopied ? 'Copied!' : 'Copy Link'}
      </button>

      {/* Mobile-responsive styling */}
      <style>{`
        @media (max-width: 640px) {
          .share-buttons {
            flex-wrap: wrap;
            gap: 8px;
          }
          .share-buttons button {
            flex: 1;
            min-width: calc(50% - 4px);
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};