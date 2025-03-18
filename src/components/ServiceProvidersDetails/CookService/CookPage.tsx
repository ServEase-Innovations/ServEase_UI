import React from 'react';
import { Card, Typography } from '@mui/material';

interface CookPageProps {
  providerDetails: any;
  role: string;
}

const CookPage: React.FC<CookPageProps> = ({ providerDetails, role }) => {
  return (
    <Card style={{ width: '100%', padding: '20px' }}>
      <Typography variant="h4">Hello, this is Cook</Typography>
      <Typography variant="body1">
        Provider Details: {providerDetails.firstName} {providerDetails.lastName}
      </Typography>
      <Typography variant="body1">Role: {role}</Typography>
      {/* Add more details as needed */}
    </Card>
  );
};

export default CookPage;