import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const CLOUDINARY_CLOUD_NAME = 'dqplj6koe';
const PROFILE_PIC_SIZE = 256;

function getCroppedImg(imageSrc: string, crop: any, zoom: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No 2d context');
      const scale = image.naturalWidth / image.width;
      canvas.width = PROFILE_PIC_SIZE;
      canvas.height = PROFILE_PIC_SIZE;
      ctx.drawImage(
        image,
        crop.x * scale,
        crop.y * scale,
        crop.width * scale,
        crop.height * scale,
        0,
        0,
        PROFILE_PIC_SIZE,
        PROFILE_PIC_SIZE
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Canvas is empty');
      }, 'image/jpeg');
    };
    image.onerror = reject;
  });
}

const ProfilePictureUploader: React.FC<{
  value?: string;
  fallback?: string;
  onUpload?: (url: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}> = ({ value, fallback, onUpload, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = open !== undefined ? open : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
      setDialogOpen(true);
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const uploadToCloudinary = async (blob: Blob) => {
    setUploading(true);
    setError(null);
    try {
      const paramsToSign = { folder: 'profile_pictures'};
      const { data: signatureData } = await api.post('/cloudinary/upload/sign', paramsToSign);
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('api_key', signatureData.api_key);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      formData.append('folder', 'profile_pictures');
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const uploadRes = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return uploadRes.data.secure_url;
    } catch (err: any) {
      setError('Upload failed.');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    setError(null);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom);
      const compressedBlob = await imageCompression(croppedBlob as File, {
        maxWidthOrHeight: PROFILE_PIC_SIZE,
        maxSizeMB: 0.2,
        useWebWorker: true,
      });
      const imageUrl = await uploadToCloudinary(compressedBlob);
      await api.put('/users/upload-picture', { imageUrl });
      if (onUpload) onUpload(imageUrl);
      setDialogOpen(false);
      setImageSrc(null);
    } catch (err: any) {
      setError('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setRemoving(true);
    setError(null);
    try {
      await api.delete('/users/remove-picture');
      if (onUpload) onUpload(null); // Pass null to indicate removal
      setDialogOpen(false);
    } catch (err: any) {
      setError('Failed to remove profile picture.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-pic-input"
        onChange={handleFileChange}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          {!imageSrc ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <label htmlFor="profile-pic-input" className="cursor-pointer w-full text-center">
                  Select Image
                </label>
              </Button>
              {value && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleRemovePicture}
                  disabled={removing}
                  className="w-full"
                >
                  {removing ? 'Removing...' : 'Remove Picture'}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48 mx-auto">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <DialogFooter className="flex flex-row gap-2 justify-end mt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setImageSrc(null); setError(null); }}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save'}
                </Button>
              </DialogFooter>
              {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUploader; 