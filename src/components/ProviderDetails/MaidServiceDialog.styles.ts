/* eslint-disable */
import styled from '@emotion/styled';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

// Define the Dinner package color scheme
const DINNER_COLOR = '#0984e3';
const DINNER_BG_COLOR = '#0984e310'; // 10% opacity
const DINNER_HOVER_COLOR = '#0873c7';

export const StyledDialog = styled(Dialog)`
  padding: 0;
  border-radius: 12px;

  .MuiPaper-root {
    width: 550px;
    border-radius: 12px;
    max-width: 100%;
  }
`;

export const StyledDialogContent = styled(DialogContent)`
  padding: 0;
`;

export const DialogContainer = styled.div`
  font-family: Arial, sans-serif;
  max-width: 550px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const CloseButton = styled(IconButton)`
  position: absolute;
  right: 16px;
  top: 16px;
  color: #2d3436;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export const DialogHeader = styled.div`
 position: relative;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(to right, #0a2a66, #328aff); 
  color: white; 
  h1 {
    color: white; 
    margin: 0;
    font-size: 24px;
    padding-right: 30px;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #f0f0f0;
`;

export const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 15px;
  background-color: #fff;
  border: none;
  border-bottom: ${props => props.active ? `3px solid ${DINNER_COLOR}` : 'none'};
  font-weight: bold;
  cursor: pointer;
  color: ${props => props.active ? '#2d3436' : '#636e72'};
  transition: all 0.2s ease;

  &:hover {
    color: #2d3436;
  }
`;

export const PackagesContainer = styled.div`
  padding: 20px;
`;

export const PackageCard = styled.div<{ selected: boolean }>`
  border: 1px solid #dfe6e9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: ${props => props.selected ? DINNER_BG_COLOR : '#fff'};
  border-left: ${props => props.selected ? `3px solid ${DINNER_COLOR}` : '1px solid #dfe6e9'};
  transition: all 0.2s ease;
`;

export const PackageHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const PackageTitle = styled.h2`
  color: #2d3436;
  margin: 0 0 5px 0;
  text-transform: capitalize;
`;

export const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const RatingValue = styled.span`
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

export const PriceValue = styled.div`
  font-weight: bold;
  color: ${DINNER_COLOR};
  font-size: 18px;
`;

export const PreparationTime = styled.div`
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
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
  }
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

export const CartButton = styled.button<{ inCart: boolean }>`
  flex: 1;
  padding: 12px;
  background-color: ${props => props.inCart ? DINNER_COLOR : '#fff'};
  color: ${props => props.inCart ? '#fff' : DINNER_COLOR};
  border: 1px solid ${DINNER_COLOR};
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.inCart ? DINNER_HOVER_COLOR : '#f5f5f5'};
  }
`;

export const SelectButton = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 12px;
  background-color: ${props => props.selected ? DINNER_COLOR : '#fff'};
  color: ${props => props.selected ? '#fff' : DINNER_COLOR};
  border: 1px solid ${DINNER_COLOR};
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.selected ? DINNER_HOVER_COLOR : '#f5f5f5'};
  }
`;

export const AddOnsContainer = styled.div`
  margin-bottom: 20px;
`;

export const AddOnsTitle = styled.h3`
  color: #2d3436;
  margin-bottom: 15px;
  font-size: 18px;
`;

export const AddOnsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
`;

export const AddOnCard = styled.div<{ selected: boolean }>`
  border: 1px solid #dfe6e9;
  border-radius: 10px;
  padding: 15px;
  flex: 1 1 45%;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-color: ${props => props.selected ? DINNER_COLOR : '#dfe6e9'};
  transition: all 0.2s ease;
`;

export const AddOnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const AddOnTitle = styled.h4`
  color: #2d3436;
  margin: 0;
  font-weight: 600;
`;

export const AddOnPrice = styled.span`
  font-weight: bold;
  color: ${DINNER_COLOR};
  font-size: 16px;
`;

export const AddOnDescription = styled.div`
  color: #636e72;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
`;

export const AddOnButton = styled.button<{ selected: boolean }>`
  width: 100%;
  padding: 10px;
  background-color: ${props => props.selected ? DINNER_COLOR : `rgba(9, 132, 227, 0.1)`};
  color: ${props => props.selected ? '#fff' : DINNER_COLOR};
  border: ${props => props.selected ? 'none' : `2px solid ${DINNER_COLOR}`};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.selected ? DINNER_HOVER_COLOR : `rgba(9, 132, 227, 0.2)`};
  }
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
  background-color: ${DINNER_COLOR};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${DINNER_HOVER_COLOR};
  }
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
  background-color: ${DINNER_COLOR};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  width: fit-content;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${DINNER_HOVER_COLOR};
  }
`;

export const CheckoutButton = styled.button<{ disabled: boolean }>`
  padding: 12px 25px;
  background-color: ${props => props.disabled ? '#bdc3c7' : DINNER_COLOR};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.disabled ? '#bdc3c7' : DINNER_HOVER_COLOR};
  }
`;