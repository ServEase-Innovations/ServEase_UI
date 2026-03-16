/* eslint-disable */
import React from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import { Button } from "../Button/button";
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from 'src/context/LanguageContext';
// Import the language context

interface CustomFileInputProps {
  name: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  buttonText?: string;
  previewWidth?: number;
  value: File | null;
  onChange: (file: File | null) => void;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  name,
  accept,
  required,
  disabled,
  buttonText,
  previewWidth = 300,
  value,
  onChange,
}) => {
  const { t } = useLanguage(); // Use the language context
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (!value && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value]);

  // Use provided buttonText or fallback to translation
  const displayButtonText = buttonText || t("chooseFile");

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        name={name}
        accept={accept}
        required={required}
        disabled={disabled}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {!value ? (
        <Button
          variant="contained"
          component="span"
          onClick={handleButtonClick}
          sx={{ mb: 2 }}
          disabled={disabled}
        >
          {displayButtonText}
        </Button>
      ) : (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {t("selectedFile")} {value.name}
              </Typography>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                sx={{ ml: 1 }}
                aria-label={t("removeFile")}
                title={t("removeFile")}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {value.type.startsWith('image/') && (
              <Box mt={2} sx={{ position: 'relative' }}>
                <Typography variant="subtitle2">{t("preview")}</Typography>
                <img
                  src={URL.createObjectURL(value)}
                  alt={t("documentPreview")}
                  width={previewWidth}
                  style={{ 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    display: 'block',
                    marginTop: '8px'
                  }}
                />
              </Box>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={handleButtonClick}
            size="small"
            sx={{ mt: 1 }}
          >
            {t("changeFile")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CustomFileInput;