// ProfileImageUpload.tsx
import React, { useRef, useState, ChangeEvent } from 'react';
import { Avatar, Box, IconButton, Typography } from '@mui/material';
import { CameraAlt as CameraAltIcon } from '@mui/icons-material';

interface ProfileImageUploadProps {
  onImageSelect: (file: File | null) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onImageSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the first selected file
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); // Preview the image
      onImageSelect(file); // Send the file to the parent component
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ height: '30vh', width: '50vw' }}
    >
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
        <Avatar
          src={previewUrl || ''}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
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
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </Box>
  );
};

export default ProfileImageUpload;
