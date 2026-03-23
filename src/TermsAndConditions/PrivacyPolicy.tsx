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
  Link,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from 'src/context/LanguageContext';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  const { t } = useLanguage(); // Add this line to use translations

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          mt: '80px',
          p: { xs: '40px 24px', md: '88px' },
          borderRadius: '2px',
          position: 'relative', // Required for absolute positioning
        }}
      >
        {onBack && (
          <IconButton
            onClick={onBack}
            aria-label="back"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: 'white',
              boxShadow: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          {t('privacyPolicy')}
        </Typography>
        
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          {t('forServEasoApp')}
        </Typography>
        
        <Typography variant="subtitle2" align="center" sx={{ mb: 3 }}>
          {t('effectiveDate', { date: 'June 22, 2025' })}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            {t('privacyIntro')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('whoWeAre')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('whoWeAreDesc')}
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('infoWeCollect')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('infoWeCollectDesc')}
        </Typography>
        
        <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
          {t('infoYouProvide')}
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('contactInformation')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('servicePreferences')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('householdInformation')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('paymentInformation')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('identificationForProviders')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('communicationContent')} />
          </ListItem>
        </List>
        
        <Typography variant="h6" component="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
          {t('autoCollectedInfo')}
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('usageData')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('technicalData')} />
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
            <ListItemText primary={t('cookiesAndTracking')} />
          </ListItem>
        </List>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
          {t('contactUs')}
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 3, borderRadius: '2px', mt: 2 }}>
          <Typography variant="body1" paragraph>
            {t('privacyContactDesc')}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>{t('tncCompanyName')}</strong><br />
            {t('tncCompanyAddress')}<br />
            {t('companyEmail')}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 4, p: 3, backgroundColor: '#fff8e1', borderRadius: '2px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('importantConsiderations')}
          </Typography>
          <Typography variant="body2" component="div">
            <List dense>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration1')} />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration2')} />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration3')} />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration4')} />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration5')} />
              </ListItem>
              <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1, py: 0 }}>
                <ListItemText primary={t('consideration6')} />
              </ListItem>
            </List>
            <Typography variant="body2" paragraph sx={{ mt: 1, fontStyle: 'italic' }}>
              {t('privacyNote')}
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;