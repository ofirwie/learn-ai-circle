import { supabase } from './supabase';

export class PDFService {
  /**
   * Upload a PDF file to Supabase Storage
   * @param file - PDF file to upload
   * @param folder - Storage folder (default: 'documents')
   * @returns Promise with the public URL of the uploaded PDF
   */
  static async uploadPDF(file: File, folder: string = 'documents'): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('📄 PDFService: Starting PDF upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: filePath
      });

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ PDFService: Upload failed:', error);
        throw new Error(`PDF upload failed: ${error.message}`);
      }

      console.log('✅ PDFService: Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded PDF');
      }

      console.log('🔗 PDFService: Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('💥 PDFService: Error:', error);
      throw error;
    }
  }

  /**
   * Validate PDF file before upload
   * @param file - File to validate
   * @returns Validation result
   */
  static validatePDF(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: 'Please select a valid PDF file' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'PDF file size must be less than 10MB' };
    }

    return { valid: true };
  }

  /**
   * Delete a PDF from Supabase Storage
   * @param pdfUrl - Public URL of the PDF to delete
   */
  static async deletePDF(pdfUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = pdfUrl.split('/storage/v1/object/public/documents/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid PDF URL format');
      }
      
      const filePath = urlParts[1];
      
      console.log('🗑️ PDFService: Deleting PDF:', filePath);

      const { error } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (error) {
        console.error('❌ PDFService: Delete failed:', error);
        throw new Error(`PDF deletion failed: ${error.message}`);
      }

      console.log('✅ PDFService: PDF deleted successfully');
    } catch (error) {
      console.error('💥 PDFService: Delete error:', error);
      throw error;
    }
  }

  /**
   * Generate a thumbnail placeholder for PDF files
   * @param fileName - Name of the PDF file
   * @returns Data URL for PDF thumbnail
   */
  static generatePDFThumbnail(fileName?: string): string {
    const displayName = fileName ? fileName.substring(0, 20) + (fileName.length > 20 ? '...' : '') : 'PDF Document';
    
    return `data:image/svg+xml;base64,${btoa(`<svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="#DC2626"/>
      <rect x="120" y="40" width="80" height="100" fill="white" rx="4"/>
      <rect x="130" y="55" width="60" height="2" fill="#DC2626"/>
      <rect x="130" y="65" width="60" height="2" fill="#DC2626"/>
      <rect x="130" y="75" width="40" height="2" fill="#DC2626"/>
      <rect x="130" y="85" width="50" height="2" fill="#DC2626"/>
      <rect x="130" y="95" width="60" height="2" fill="#DC2626"/>
      <rect x="130" y="105" width="30" height="2" fill="#DC2626"/>
      <rect x="130" y="115" width="45" height="2" fill="#DC2626"/>
      <text x="160" y="160" text-anchor="middle" fill="white" font-size="12" font-family="Arial">PDF</text>
    </svg>`)}`;
  }
}