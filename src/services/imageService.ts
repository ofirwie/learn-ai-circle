import { supabase } from './supabase'

export class ImageService {
  /**
   * Upload an image file to Supabase Storage
   * @param file - Image file to upload
   * @param folder - Storage folder (default: 'articles')
   * @returns Promise with the public URL of the uploaded image
   */
  static async uploadImage(file: File, folder: string = 'articles'): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log('🖼️ ImageService: Starting image upload...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath: filePath
      })

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ ImageService: Upload failed:', error)
        throw new Error(`Image upload failed: ${error.message}`)
      }

      console.log('✅ ImageService: Upload successful:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      console.log('🔗 ImageService: Public URL generated:', urlData.publicUrl)
      return urlData.publicUrl

    } catch (error) {
      console.error('💥 ImageService: Error:', error)
      throw error
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param imageUrl - Public URL of the image to delete
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/storage/v1/object/public/images/')
      if (urlParts.length !== 2) {
        throw new Error('Invalid image URL format')
      }
      
      const filePath = urlParts[1]
      
      console.log('🗑️ ImageService: Deleting image:', filePath)

      const { error } = await supabase.storage
        .from('images')
        .remove([filePath])

      if (error) {
        console.error('❌ ImageService: Delete failed:', error)
        throw new Error(`Image deletion failed: ${error.message}`)
      }

      console.log('✅ ImageService: Image deleted successfully')
    } catch (error) {
      console.error('💥 ImageService: Delete error:', error)
      throw error
    }
  }

  /**
   * Validate image file before upload
   * @param file - File to validate
   * @returns Validation result
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select a valid image file' }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image file size must be less than 5MB' }
    }

    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: 'Supported formats: JPEG, PNG, GIF, WebP' }
    }

    return { valid: true }
  }
}