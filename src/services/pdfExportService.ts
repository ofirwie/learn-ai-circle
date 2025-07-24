import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Article } from '../types/content';

export class PDFExportService {
  /**
   * Export article as PDF
   * @param article - Article to export
   * @param elementId - ID of the element to capture (optional)
   */
  static async exportArticleToPDF(article: Article, elementId?: string): Promise<void> {
    try {
      console.log('📄 Starting PDF export for:', article.title);

      // Create a temporary container for clean PDF content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.color = '#333';

      // Create clean content for PDF
      const cleanContent = this.createCleanContent(article);
      tempContainer.innerHTML = cleanContent;
      
      document.body.appendChild(tempContainer);

      // Generate canvas from the content
      const canvas = await html2canvas(tempContainer, {
        width: 800,
        height: tempContainer.scrollHeight,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF export completed:', fileName);
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error('Failed to export PDF. Please try again.');
    }
  }

  /**
   * Create clean HTML content for PDF export
   */
  private static createCleanContent(article: Article): string {
    // Process content to remove complex formatting and make it PDF-friendly
    let cleanContent = article.content || '';

    // Remove YouTube embeds and replace with text
    cleanContent = cleanContent.replace(
      /<div class="youtube-embed"[^>]*>.*?<\/div>/gs,
      '<p style="background: #f0f0f0; padding: 10px; border-left: 4px solid #2563eb; margin: 20px 0;"><strong>📺 Video Content:</strong> This article contains video content. Visit the web version to watch.</p>'
    );

    // Convert iframes to text
    cleanContent = cleanContent.replace(
      /<iframe[^>]*src="[^"]*youtube[^"]*"[^>]*>.*?<\/iframe>/gs,
      '<p style="background: #f0f0f0; padding: 10px; border-left: 4px solid #2563eb; margin: 20px 0;"><strong>📺 Video:</strong> YouTube video embedded here</p>'
    );

    // Clean up other complex elements
    cleanContent = cleanContent
      // Remove any remaining style attributes
      .replace(/style="[^"]*"/g, '')
      // Clean up excess whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Process article metadata
    const publishDate = article.published_at || article.created_at;
    const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString() : '';

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1e293b; font-size: 28px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.3;">
            ${article.title}
          </h1>
          ${article.excerpt ? `
            <p style="color: #64748b; font-size: 16px; margin: 10px 0; font-style: italic;">
              ${article.excerpt}
            </p>
          ` : ''}
          <div style="color: #64748b; font-size: 14px; margin-top: 15px;">
            ${article.author ? `<strong>By:</strong> ${article.author}` : ''}
            ${article.author && formattedDate ? ' • ' : ''}
            ${formattedDate ? `<strong>Published:</strong> ${formattedDate}` : ''}
            ${article.category ? ` • <strong>Category:</strong> ${article.category}` : ''}
          </div>
        </div>

        <!-- Featured Image -->
        ${article.featured_image ? `
          <div style="text-align: center; margin: 30px 0;">
            <img src="${article.featured_image}" alt="${article.title}" 
                 style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
          </div>
        ` : ''}

        <!-- Content -->
        <div style="font-size: 14px; line-height: 1.8; color: #374151;">
          ${cleanContent}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Generated from ISAI Knowledge Hub • ${new Date().toLocaleDateString()}</p>
          <p>Visit https://isai-hub.vercel.app for the latest content</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate shareable WhatsApp link
   */
  static generateWhatsAppLink(article: Article): string {
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}?article=${article.id}`;
    const message = `Check out this article: "${article.title}" - ${articleUrl}`;
    
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  /**
   * Open WhatsApp share
   */
  static shareOnWhatsApp(article: Article): void {
    const whatsappUrl = this.generateWhatsAppLink(article);
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Copy article link to clipboard
   */
  static async copyArticleLink(article: Article): Promise<boolean> {
    try {
      const baseUrl = window.location.origin;
      const articleUrl = `${baseUrl}?article=${article.id}`;
      
      await navigator.clipboard.writeText(articleUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy link:', error);
      return false;
    }
  }
}