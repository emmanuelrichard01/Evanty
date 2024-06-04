'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from '@uploadthing/react/hooks';
import { generateClientDropzoneAccept } from 'uploadthing/client';
import { Button } from '@/components/ui/button';
import { convertFileToUrl } from '@/lib/utils';

type FileWithPath = File & { path?: string };

type FileUploaderProps = {
  imageUrl: string;
  onImageChange: (url: string) => void;
};

export function FileUploader({ imageUrl, onImageChange }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState(imageUrl);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
    const url = convertFileToUrl(acceptedFiles[0]);
    setPreviewUrl(url);
    onImageChange(url);
  }, [onImageChange]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(['image/*']),
  });

  useEffect(() => {
    if (imageUrl) {
      setPreviewUrl(imageUrl);
    }
  }, [imageUrl]);

  return (
    <div
      {...getRootProps()}
      className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50"
    >
      <input {...getInputProps()} className="cursor-pointer" />

      {previewUrl ? (
        <div className="flex h-full w-full flex-1 justify-center">
          <img
            src={previewUrl}
            alt="uploaded file"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-grey-500">
          <img src="/assets/icons/upload.svg" width={77} height={77} alt="file upload" />
          <h3 className="mb-2 mt-2">Drag photo here</h3>
          <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
          <Button type="button" className="rounded-full">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
}
