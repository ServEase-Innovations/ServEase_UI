/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useRef, useState, ChangeEvent, useCallback } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material';
import Cropper from 'react-easy-crop';

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Handle CORS issues
    image.src = url;
  });

const cropImage = async (imageSrc: string, pixelCrop: any) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob); // Return the Blob directly
    }, 'image/jpeg');
  });
};

interface ProfileImageUploadProps {
  onImageSelect: (file: File | null) => void; // Parent expects File, not Blob
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onImageSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImageBlob = await cropImage(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          // Convert Blob to File
          const file = new File([croppedImageBlob], 'cropped-image.jpg', {
            type: 'image/jpeg',
          });

          // Pass the File to the parent component
          onImageSelect(file);

          const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
          setPreviewUrl(croppedImageUrl); // Set the cropped image as profile picture
          setIsCropDialogOpen(false); // Close crop dialog
        }
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box
        sx={{
          position: 'relative',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <Avatar src={previewUrl || ''} sx={{ width: '100%', height: '100%', objectFit: 'cover' }}>
          {!previewUrl && (
            <CameraAltIcon
              sx={{
                fontSize: 40,
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                padding: '8px',
              }}
            />
          )}
        </Avatar>
        {previewUrl && (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: '5px',
              right: '5px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
            }}
            onClick={handleClick}
          >
            <CameraAltIcon />
          </IconButton>
        )}
      </Box>
      <Typography variant="subtitle1" gutterBottom sx={{ marginTop: '10px' }}>
        Upload Profile Picture
      </Typography>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} ref={fileInputRef} />

      {/* Crop Dialog */}
      <Dialog open={isCropDialogOpen} onClose={() => setIsCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ position: 'relative', height: 400, width: '100%' }}>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // 1:1 aspect ratio
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCropDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCropConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileImageUpload;
