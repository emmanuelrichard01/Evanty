'use client'

import { useCallback, Dispatch, SetStateAction, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { convertFileToUrl } from '@/lib/utils'
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

type FileUploaderProps = {
  onFieldChange: (url: string) => void
  imageUrl: string
  setFiles: Dispatch<SetStateAction<File[]>>
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0]
    setFiles([file])

    // Client-side Direct upload to Cloudflare R2 via pre-signed URL
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 1. Request a pre-signed URL from our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate upload URL')
      }

      const { url: signedUrl, publicUrl } = await response.json()

      // 2. Perform direct upload via PUT request using XMLHttpRequest to track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', signedUrl, true)
        xhr.setRequestHeader('Content-Type', file.type)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percentComplete)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Network error during upload'))
        }

        xhr.send(file)
      })

      // 3. Update the field with the final public URL
      onFieldChange(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('File upload error:', error)
      toast.error(error.message || 'Error uploading file')
    } finally {
      setIsUploading(false)
    }
  }, [onFieldChange, setFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp']
    },
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className={`relative flex-center flex h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isDragActive
          ? 'border-indigo-500 bg-indigo-50/30'
          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {isUploading ? (
        <div className="flex-center flex-col p-6 w-full h-full bg-white/95 backdrop-blur-sm z-10 transition-opacity">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-semibold text-slate-700 mb-2">Uploading cover image...</p>
          <div className="w-56 bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 mt-2">{uploadProgress}%</span>
        </div>
      ) : imageUrl ? (
        <div className="group relative flex h-full w-full flex-1 justify-center items-center">
          <img
            src={imageUrl}
            alt="image"
            className="w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-[0.7]"
          />
          <div className="absolute inset-0 flex-center flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 text-white gap-2">
            <UploadCloud className="h-8 w-8 text-white drop-shadow-sm" strokeWidth={1.8} />
            <p className="text-sm font-semibold tracking-wide">Drop or click to replace image</p>
          </div>
        </div>
      ) : (
        <div className="flex-center flex-col py-6 text-slate-500 px-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
            <UploadCloud className="h-7 w-7 text-indigo-500" strokeWidth={1.8} />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-slate-800">Drag & drop your event cover</h3>
          <p className="text-xs text-slate-400 mb-4">PNG, JPG, WEBP, or SVG up to 10MB</p>
          <Button type="button" size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-4 shadow-sm active:scale-[0.98] transition-all">
            Select file
          </Button>
        </div>
      )}
    </div>
  )
}
