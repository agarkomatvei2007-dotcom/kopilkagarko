import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage'
import { storage, isFirebaseConfigured } from './config'

export interface UploadProgress {
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: Error
}

export interface UploadedFile {
  name: string
  url: string
  path: string
  size: number
  type: string
}

// Helper to check if storage is available
function requireStorage() {
  if (!storage) {
    throw new Error('Firebase не настроен. Пожалуйста, добавьте ключи Firebase в .env.local')
  }
  return storage
}

// Upload a file and return the download URL
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(requireStorage(), path)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

// Upload a file with progress callback
export function uploadFileWithProgress(
  file: File,
  path: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(requireStorage(), path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress({ progress, status: 'uploading' })
      },
      (error) => {
        onProgress({ progress: 0, status: 'error', error })
        reject(error)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        onProgress({ progress: 100, status: 'completed' })
        resolve(downloadURL)
      }
    )
  })
}

// Upload avatar
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`
  const path = `avatars/${userId}/${fileName}`
  return uploadFile(file, path)
}

// Upload material file
export async function uploadMaterialFile(
  userId: string,
  materialId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  const fileName = `${Date.now()}_${file.name}`
  const path = `materials/${userId}/${materialId}/${fileName}`

  let url: string
  if (onProgress) {
    url = await uploadFileWithProgress(file, path, onProgress)
  } else {
    url = await uploadFile(file, path)
  }

  return {
    name: file.name,
    url,
    path,
    size: file.size,
    type: file.type,
  }
}

// Upload thumbnail
export async function uploadThumbnail(
  materialId: string,
  file: File
): Promise<string> {
  const fileName = `thumbnail_${Date.now()}.${file.name.split('.').pop()}`
  const path = `thumbnails/${materialId}/${fileName}`
  return uploadFile(file, path)
}

// Upload chat file
export async function uploadChatFile(
  chatId: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}_${file.name}`
  const path = `chat-files/${chatId}/${fileName}`
  return uploadFile(file, path)
}

// Delete a file
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(requireStorage(), path)
  await deleteObject(storageRef)
}

// Delete all files in a folder
export async function deleteFolder(folderPath: string): Promise<void> {
  const folderRef = ref(requireStorage(), folderPath)
  const list = await listAll(folderRef)

  const deletePromises = list.items.map(item => deleteObject(item))
  await Promise.all(deletePromises)

  // Recursively delete subfolders
  const subfolderPromises = list.prefixes.map(prefix => deleteFolder(prefix.fullPath))
  await Promise.all(subfolderPromises)
}

// Get file extension from URL or filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// Check if file is a video
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

// Check if file is an audio
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

// Check if file is a document (PDF, DOC, etc.)
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ]
  return documentTypes.includes(file.type)
}

// Check if file is a presentation
export function isPresentationFile(file: File): boolean {
  const presentationTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]
  return presentationTypes.includes(file.type)
}

// Get file type category
export function getFileCategory(file: File): 'image' | 'video' | 'audio' | 'document' | 'presentation' | 'other' {
  if (isImageFile(file)) return 'image'
  if (isVideoFile(file)) return 'video'
  if (isAudioFile(file)) return 'audio'
  if (isPresentationFile(file)) return 'presentation'
  if (isDocumentFile(file)) return 'document'
  return 'other'
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file size
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Generate thumbnail from video (client-side)
export function generateVideoThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.preload = 'metadata'
    video.src = URL.createObjectURL(videoFile)

    video.onloadedmetadata = () => {
      video.currentTime = 1 // Get frame at 1 second
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
        URL.revokeObjectURL(video.src)
      }, 'image/jpeg', 0.7)
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }
  })
}
