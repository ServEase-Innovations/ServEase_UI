import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
  Chip
} from '@mui/material';
import { Info as InfoIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const KeyFactsStatement = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Key Facts Statement
          </Typography>
          <Chip label="Effective: June 22, 2025" color="primary" />
        </Box>

        <Typography variant="subtitle1" color="text.secondary" paragraph>
          For ServEaso App - Unit of ServEase Innovation Talent Tap Pvt Ltd.
        </Typography>

        <Box sx={{ backgroundColor: '#e3f2fd', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="primary" sx={{ mr: 1 }} />
            This document provides a summary of the most important terms of our service. Please read our full 
            <Link href="/tnc" sx={{ mx: 0.5 }}>Terms and Conditions</Link> and 
            <Link href="/privacy" sx={{ ml: 0.5 }}>Privacy Statement</Link> for complete details.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          1. Our Role as an Aggregator
        </Typography>
        <List dense>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText 
              primary="What we do:" 
              secondary="ServEase Innovation acts as an agency/online platform connecting you with qualified and vetted Maid, Nanny, and Cook Service Providers. We manage the matching, scheduling, and administrative aspects." 
            />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText 
              primary="Employment Status:" 
              secondary="The Service Providers are either employed by Us or contracted as independent professionals under our supervision and management. You are not the direct employer of the Service Provider." 
            />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          2. Services Offered & Scope
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
          Service Types:
        </Typography>
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            • Maid Services:
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            General cleaning, tidying, laundry, ironing, dishwashing
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            • Caregiver Services:
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Childcare, Old Age Care, supervision, age-appropriate activities, meal preparation for children
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            • Cook Services:
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            Meal preparation (based on agreed menus/dietary needs), grocery shopping (if agreed)
          </Typography>
        </Box>

        <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
          Exclusions:
        </Typography>
        <Typography variant="body2" sx={{ ml: 2 }}>
          Services typically NOT included (unless specifically agreed and charged for): deep cleaning beyond standard, heavy lifting, specialized repairs, pet care, or personal care for adults.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          3. Pricing & Fees
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
            Standard Rates:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Demand Services:
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Maid service: INR 250 - 700/hour" secondary="Based on premium service and property size" />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Cook service: INR 250 - 700/hour" secondary="Based on premium service and number of persons" />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Caregiver service: INR 1,000 - 3,000/day" secondary="Based on premium service and care requirements" />
              </ListItem>
            </List>

            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Monthly/Regular Services:
            </Typography>
            <List dense>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Monthly Maid service: INR 4,000 - 16,000/month" />
              </ListItem>
              <ListItem sx={{ py: 0 }}>
                <ListItemText primary="• Monthly Nanny service: INR 5,000 - 30,000/month" secondary="3 hours to 24-hour live-in service" />
              </ListItem>
            </List>
          </Box>

          <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
            Additional Charges:
          </Typography>
          <List dense sx={{ ml: 2 }}>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary="• Overtime: 1.5x standard rate (6:00 AM – 8:00 PM)" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary="• Public Holidays: 1.5x standard rate" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary="• Special Requests: 1.5x standard rate" />
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <ListItemText primary="• Cancellation Fee: 50% if within 24 hours" />
            </ListItem>
          </List>
        </Box>

        {/* Continue with all other sections following the same pattern */}

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          9. Governing Law
        </Typography>
        <Typography variant="body1">
          This service agreement is governed by the laws of India and the federal laws of the Indian States if applicable.
        </Typography>

        <Box sx={{ mt: 4, p: 3, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Key Benefits of This Statement
          </Typography>
          <List dense>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
              <ListItemText primary="Transparency: Builds trust with clients by clearly outlining essential information upfront." />
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
              <ListItemText primary="Clarity: Simplifies complex terms into an easily digestible format." />
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
              <ListItemText primary="Reduces Disputes: By setting clear expectations, it can minimize misunderstandings." />
            </ListItem>
            <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
              <ListItemText primary="Professionalism: Demonstrates your commitment to clear communication." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mt: 4, borderTop: '1px solid #e0e0e0', pt: 2 }}>
          <Typography variant="body2" paragraph>
            For complete details of your agreement, please refer to our full Terms and Conditions and Privacy Statement available at:
          </Typography>
          <Link href="www.serveaso.com/tnc" variant="body2">www.serveaso.com/tnc</Link>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>ServEase Innovation Talent Tap</strong><br />
            #58 Sir MV Nagar, Ramamurthy Nagar,<br />
            Bengaluru, Karnataka<br />
            Email: <Link href="mailto:support@serveasinnovation.com">support@serveasinnovation.com</Link> or <Link href="mailto:support@serveaso.com">support@serveaso.com</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default KeyFactsStatement;