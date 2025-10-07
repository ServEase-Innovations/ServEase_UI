/* eslint-disable */
import React from 'react';
import { Container, Typography, Box, Paper, Divider, List, ListItem, ListItemText } from '@mui/material';

// Define the props interface
interface TnCProps {
  onBack?: () => void;
}

const TnC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ✅ Updated padding and border radius */}
      <Paper elevation={3} sx={{ p: '88px', borderRadius: '2px' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          Terms and Conditions
        </Typography>

        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          For ServEaso App - Unit of ServEase Innovation Talent Tap Pvt Ltd.
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            Welcome to ServEaso App! We are delighted to provide you with professional
            household services, including maid, nanny, and cook services. By engaging our
            services, you agree to the following terms and conditions:
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          1. Definitions
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="• 'Company', 'We', 'Us', 'Our': ServEaso App – a unit of ServEase Innovation Talent Tap."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• 'Client', 'You', 'Your': Refers to the individual or entity engaging our services."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• 'Service Provider(s)': Refers to the maid(s), nanny(ies), or cook(s) provided by the Company."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• 'Services': Refers to the household services provided by the Company."
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 'Agreement': Refers to these Terms and Conditions." />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          2. Service Agreement
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="a. Engagement: By requesting and accepting our services, you enter into a service agreement with ServEase Innovation subject to these Terms and Conditions."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="b. Scope of Work: The specific services to be provided, the schedule, and any special instructions will be agreed upon in writing prior to the commencement of services."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="c. Changes to Services: Any changes to the agreed-upon services must be communicated to and approved by the Company in advance. Additional charges may apply."
            />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          3. Client Responsibilities
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="a. Safe Environment: You agree to provide a safe, secure, and appropriate working environment for the Service Provider(s)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="b. Access: You must provide timely and unobstructed access to your premises at the agreed-upon service times."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="c. Information Accuracy: You are responsible for providing accurate and complete information regarding your needs."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="d. Supervision (for Nannies): While our nannies are experienced professionals, the Client retains overall responsibility for the safety and well-being of their children."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="e. Equipment & Supplies: Unless otherwise agreed, you are responsible for providing necessary cleaning supplies, equipment, and cooking ingredients."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="f. Direct Engagement Prohibition: You agree not to directly hire any Service Provider introduced to you by ServEaso for a period of 12 months from the last date of service."
            />
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          13. Contact Information
        </Typography>

        <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: 1, mt: 2 }}>
          <Typography variant="body1" paragraph>
            For any questions or concerns regarding these Terms and Conditions or our services,
            please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>ServEase Innovation Talent Tap</strong>
            <br />
            #58 Sir MV Nagar, Ramamurthy Nagar,
            <br />
            Bengaluru, Karnataka
            <br />
            Email - support@serveasinnovation.com or support@serveaso.com
          </Typography>
        </Box>

        <Box sx={{ mt: 4, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Important Considerations:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li>
                Local Labor Laws: Extremely critical for employment status, working hours, rest
                breaks, and termination procedures.
              </li>
              <li>Consumer Protection Laws: Ensure fairness and transparency.</li>
              <li>Data Privacy Laws: If you collect any personal data, you'll need a privacy policy.</li>
              <li>Specific Service Nuances for different types of service providers.</li>
              <li>Insurance Coverage: Ensure your insurance policies align with your liability clauses.</li>
              <li>Dispute Resolution: Consider arbitration or mediation as alternatives to court.</li>
            </ul>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TnC;
