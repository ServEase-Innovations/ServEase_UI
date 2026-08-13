import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutUs from './AboutUs';
import { useLanguage } from 'src/context/LanguageContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the LanguageContext
jest.mock('src/context/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('AboutUs Component', () => {
  const mockOnBack = jest.fn();
  const theme = createTheme();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementation for useLanguage
    (useLanguage as jest.Mock).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          backToHome: 'Back to Home',
          aboutUs: 'About Us',
          aboutUsHero1: 'Hero text 1',
          aboutUsHero2: 'Hero text 2',
          ourStory: 'Our Story',
          ourStory1: 'Story paragraph 1',
          ourStory2: 'Story paragraph 2',
          challengesWeSolve: 'Challenges We Solve',
          highTurnover: 'High Turnover',
          highTurnoverDesc: 'High turnover description',
          skillsGap: 'Skills Gap',
          skillsGapDesc: 'Skills gap description',
          communicationBarriers: 'Communication Barriers',
          communicationBarriersDesc: 'Communication barriers description',
          trustAndSecurity: 'Trust and Security',
          trustAndSecurityDesc: 'Trust and security description',
          dependenceAndEntitlement: 'Dependence and Entitlement',
          dependenceAndEntitlementDesc: 'Dependence and entitlement description',
          lackOfLegalProtection: 'Lack of Legal Protection',
          lackOfLegalProtectionDesc: 'Lack of legal protection description',
          socialIsolation: 'Social Isolation',
          socialIsolationDesc: 'Social isolation description',
          employerMaidRelationship: 'Employer-Maid Relationship',
          employerMaidRelationshipDesc: 'Employer-maid relationship description',
          limitedAccessToHealthcare: 'Limited Access to Healthcare',
          limitedAccessToHealthcareDesc: 'Limited access to healthcare description',
          lackOfStandardizedPractices: 'Lack of Standardized Practices',
          lackOfStandardizedPracticesDesc: 'Lack of standardized practices description',
        };
        return translations[key] || key;
      },
    });
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider theme={theme}>
        <AboutUs onBack={mockOnBack} />
      </ThemeProvider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', () => {
    renderComponent();
    
    const backButton = screen.getByRole('button', { name: /back to home/i });
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders all the challenge titles and descriptions', () => {
    renderComponent();

    // Verify a few specific challenges are rendered correctly
    expect(screen.getByText('High Turnover')).toBeInTheDocument();
    expect(screen.getByText('High turnover description')).toBeInTheDocument();
    
    expect(screen.getByText('Skills Gap')).toBeInTheDocument();
    expect(screen.getByText('Skills gap description')).toBeInTheDocument();

    expect(screen.getByText('Lack of Standardized Practices')).toBeInTheDocument();
    expect(screen.getByText('Lack of standardized practices description')).toBeInTheDocument();
  });

  it('renders the hero section text', () => {
    renderComponent();
    
    expect(screen.getByText(/Hero text 1/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ServEaso/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Hero text 2/i)).toBeInTheDocument();
  });

  it('renders the story paragraphs', () => {
    renderComponent();
    
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText('Story paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Story paragraph 2')).toBeInTheDocument();
  });
});
