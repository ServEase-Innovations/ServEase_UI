/* eslint-disable @typescript-eslint/no-unused-vars */

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const DialogComponent = ({ 
  open, 
  onClose, 
  title, 
  children, 
  onSave, 
  disableConfirm = false // Default value ensures backward compatibility
}) => {
  const getButtonText = () => {
    if (title === "Select your Booking") {
      return "Confirm";
    } else {
      return "Add to Cart";
    }
  };

  return (
    <BootstrapDialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onSave} disabled={disableConfirm}>
          {getButtonText()}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default DialogComponent;

// import * as React from 'react';
// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
// import Button from '@mui/material/Button';
// import { styled } from '@mui/material/styles';

// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//   '& .MuiDialogContent-root': {
//     padding: theme.spacing(2),
//   },
//   '& .MuiDialogActions-root': {
//     padding: theme.spacing(1),
//   },
// }));

// const DialogComponent = ({ 
//   open, 
//   onClose, 
//   title, 
//   children, 
//   onSave, 
//   disableConfirm = false, // Default value ensures backward compatibility
//   isItemSelected = false // New prop to track item selection
// }) => {
//   const getButtonText = () => {
//     if (title === "Select your Booking") {
//       return "Confirm";
//     } else {
//       return "Add to Cart";
//     }
//   };

//   return (
//     <BootstrapDialog onClose={onClose} aria-labelledby="customized-dialog-title" open={open}>
//       <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
//         {title}
//       </DialogTitle>
//       <IconButton
//         aria-label="close"
//         onClick={onClose}
//         sx={(theme) => ({
//           position: 'absolute',
//           right: 8,
//           top: 8,
//           color: theme.palette.grey[500],
//         })}
//       >
//         <CloseIcon />
//       </IconButton>
//       <DialogContent dividers>{children}</DialogContent>
//       <DialogActions>
//         <Button 
//           autoFocus 
//           onClick={onSave} 
//           disabled={disableConfirm || (!isItemSelected && title !== "Select your Booking")}
//         >
//           {getButtonText()}
//         </Button>
//       </DialogActions>
//     </BootstrapDialog>
//   );
// };

// export default DialogComponent;
