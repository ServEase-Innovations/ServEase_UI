/* eslint-disable */
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
  Link
} from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ⬇️ Changed padding to 88px and border-radius to 2px */}
      <Paper elevation={3} sx={{ p: '88px', borderRadius: '2px' }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          Privacy Statement
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          For ServEaso App - Unit of ServEase Innovation Talent Tap Pvt Ltd.
        </Typography>
        
        <Typography variant="subtitle2" align="center" sx={{ mb: 3 }}>
          Effective Date: June 22, 2025
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            At ServEase Innovation Talent Tap, we are committed to protecting the privacy and 
            personal data of our clients and service providers. This Privacy Statement explains how 
            we collect, use, disclose, and protect your personal information when you use our 
            maid, nanny, and cook services.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          1. Who We Are
        </Typography>
        <Typography variant="body1" paragraph>
          ServEase Innovation Talent Tap is a service provider based in Karnataka, India, 
          specializing in connecting clients with qualified household service professionals.
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          2. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect various types of information to provide and improve our services to you. 
          This may include:
        </Typography>
        
        <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
          a. Information You Provide Directly:
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Contact Information: Name, address, email address, phone number and KYC document." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Service Preferences: Details about the type of service required (maid, nanny, cook), frequency, schedule, specific tasks, special instructions." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Household Information: Number of children, pets, size of residence, specific areas to be serviced." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Payment Information: Billing address, UPI, credit/debit card details (processed securely via third-party payment processors)." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Identification (for Service Providers): Aadhar Card, passport details, work permits, educational qualifications, previous employment history." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Communication Content: Information you provide when communicating with us via phone, email, or messaging apps." />
          </ListItem>
        </List>
        
        <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
          b. Information We Collect Automatically:
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Usage Data: Information about how you interact with our website or mobile application." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Technical Data: IP address, browser type, operating system, device identifiers." />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary="Cookies and Tracking Technologies: We may use cookies and similar technologies to enhance your experience." />
          </ListItem>
        </List>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          10. Contact Us
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: '2px', mt: 2 }}>
          <Typography variant="body1" paragraph>
            If you have any questions or concerns about this Privacy Statement or our data 
            practices, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>ServEase Innovation Talent Tap</strong><br />
            #58 Sir MV Nagar, Ramamurthy Nagar,<br />
            Bengaluru, Karnataka<br />
            Email - <Link href="mailto:support@serveasinnovation.com">support@serveasinnovation.com</Link> or <Link href="mailto:support@serveaso.com">support@serveaso.com</Link>
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4, p: 3, backgroundColor: '#fff8e1', borderRadius: '2px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Crucial Considerations for Your Legal Review:
          </Typography>
          <Typography variant="body2" component="div">
            <List dense>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL): Your privacy statement must align with its principles." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Consent: Ensure your consent mechanisms are clear and verifiable." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Sensitive Personal Data: Specify the lawful basis for processing sensitive data." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Children's Data: Ensure compliance with specific provisions regarding children's data." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Data Breach Notification: Familiarize yourself with the requirements for notifying authorities." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Data Protection Officer (DPO): Depending on the scale of processing, you might need to appoint a DPO." />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary="Cross-Border Transfers: Ensure adequate protection mechanisms for data transferred outside India." />
              </ListItem>
            </List>
            <Typography variant="body2" paragraph sx={{ mt: 1, fontStyle: 'italic' }}>
              Important Note: This should be reviewed and customized by a legal professional
              to ensure full compliance with India's data protection laws.
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
