/* eslint-disable */
import { Dialog, DialogContent, Tooltip, IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import styled from '@emotion/styled';
import CloseIcon from '@mui/icons-material/Close'; // Add this import

const DINNER_COLOR = '#0984e3'; // The blue color from Dinner package
const DINNER_BG_COLOR = '#0984e310'; // Light blue background (10% opacity)

export const StyledDialog = styled(Dialog)`
  padding: 0px;
  border-radius: 12px;

  .MuiPaper-root {
    width: 500px;
    border-radius: 12px;
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  padding: 0;
`;

export const DialogContainer = styled.div`
  font-family: Arial, sans-serif;
  max-width: 550px;
  width: 100%;
`;
export const CareTypeSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;
export const AgeInfoText = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  font-style: italic;
`;
export const CareTypeTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #0e305c;
  margin-bottom: 1rem;
`;
// Add this new styled component at the top of your styles file
export const CloseButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  top: 16px;
  color: #2d3436;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

// Update the DialogHeader to include position relative
export const DialogHeader = styled.div`
  position: relative;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;

  h1 {
    color: #2d3436;
    margin: 0 0 15px 0;
    font-size: 24px;
    padding-right: 30px; // Add space for the close button
  }
`;

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #f0f0f0;
`;

export const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 15px;
  background-color: ${props => props.active ? '#f5fbff' : '#fff'};
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: ${props => props.active ? '#0984e3' : '#2d3436'};
  transition: all 0.2s ease;
  
  &:hover {
    color: #0984e3;
    background-color: #f5fbff;
  }
`;

export const TabIndicator = styled.div<{ active: boolean }>`
  border-bottom: ${props => props.active ? '2px solid #0984e3' : 'none'};
  width: 50%;
  margin: 0 auto;
  padding-bottom: 8px; 
`;

export const PackagesContainer = styled.div`
  padding: 20px;
`;

export const PackageCard = styled.div<{ selected: boolean }>`
  border: 1px solid #dfe6e9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${props => props.selected ? '#0984e310' : '#fff'};
  border-left: ${props => props.selected ? '3px solid #0984e3' : '1px solid #dfe6e9'};
  transition: all 0.2s ease;
`;

export const PackageHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const PackageTitle = styled.h2`
  color: #2d3436;
  margin: 0 0 5px 0;
`;

export const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const RatingValue = styled.span<{ color: string }>`
color: ${DINNER_COLOR};
  font-weight: bold;
`;

export const ReviewsText = styled.span`
  color: #636e72;
  font-size: 14px;
  margin-left: 5px;
`;

export const PriceContainer = styled.div`
  text-align: right;
`;

export const PriceValue = styled.div<{ color: string }>`
  font-weight: bold;
   color: ${DINNER_COLOR};
  font-size: 18px;
`;

export const CareType = styled.div`
  color: #636e72;
  font-size: 14px;
`;

export const PersonsControl = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
`;

export const PersonsLabel = styled.span`
  margin-right: 15px;
  color: #2d3436;
`;

export const PersonsInput = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #dfe6e9;
  border-radius: 20px;
`;

export const PersonsButton = styled.button`
  padding: 5px 10px;
  background-color: #f5f5f5;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

export const DecrementButton = styled(PersonsButton)`
  border-right: 1px solid #dfe6e9;
  border-radius: 20px 0 0 20px;
`;

export const IncrementButton = styled(PersonsButton)`
  border-left: 1px solid #dfe6e9;
  border-radius: 0 20px 20px 0;
`;

export const PersonsValue = styled.span`
  padding: 5px 15px;
  min-width: 20px;
  text-align: center;
`;

export const DescriptionList = styled.div`
  margin: 15px 0;
`;

export const DescriptionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

export const DescriptionBullet = styled.span`
  margin-right: 10px;
  color: #2d3436;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

export const SelectButton = styled.button<{ selected: boolean; color: string }>`
  width: 50%;
  padding: 12px;
  background-color: ${props => props.selected ? props.color : '#fff'};
  color: ${props => props.selected ? '#fff' : props.color};
  border: 1px solid ${props => props.color};
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
`;

export const CartButton = styled.button<{ inCart: boolean; color: string }>`
  width: 100%;
  padding: 12px;
  background-color: ${props => props.inCart ? '#0984e3' : '#fff'};
  color: ${props => props.inCart ? '#fff' : '#0984e3'};
  border: 1px solid #0984e3;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;
`;

export const VoucherContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f8f9fa;
`;

export const VoucherTitle = styled.h3`
  color: #2d3436;
  margin: 0 0 10px 0;
  font-size: 16px;
`;

export const VoucherInputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const VoucherInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 14px;
`;

export const VoucherButton = styled.button`
  padding: 10px 20px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
`;

export const FooterContainer = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
`;

export const FooterText = styled.div`
  color: #636e72;
  font-size: 14px;
`;

export const FooterPrice = styled.div`
  font-weight: bold;
  font-size: 20px;
  color: ${DINNER_COLOR};
`;

export const FooterButtons = styled.div`
  display: flex;
  align-items: center;
`;

export const LoginButton = styled.button`
  padding: 8px 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  width: fit-content;
`;

export const CheckoutButton = styled.button<{ disabled: boolean }>`
  padding: 12px 25px;
   background-color: ${props => props.disabled ? '#bdc3c7' : DINNER_COLOR};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;