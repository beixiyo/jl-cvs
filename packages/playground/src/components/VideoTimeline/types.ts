export interface VideoFrame {
  /**
   * Unique identifier for the frame
   */
  id: string

  /**
   * URL to the frame image
   */
  src: string

  /**
   * Timestamp in seconds
   */
  timestamp: number

  /**
   * Optional metadata for the frame
   */
  metadata?: Record<string, any>
}
