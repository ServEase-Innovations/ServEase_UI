import React, { useCallback } from "react";
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Alert,
  AlertTitle,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import {
  AccountBalance as BankIcon,
  Person as PersonIcon,
  CreditCard as CardIcon,
  Code as CodeIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

export interface BankDetailsData {
  bankName: string;
  ifscCode: string;
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  upiId: string;
}

export interface BankDetailsErrors {
  bankName?: string;
  ifscCode?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  upiId?: string;
}

interface BankDetailsProps {
  formData: BankDetailsData;
  errors: BankDetailsErrors;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
  onFieldFocus?: (fieldName: string) => void;
}

const accountTypes = [
  { label: "Savings Account", value: "SAVINGS" },
  { label: "Current Account", value: "CURRENT" },
  { label: "Salary Account", value: "SALARY" },
  { label: "Fixed Deposit Account", value: "FIXED_DEPOSIT" },
  { label: "NRI Account", value: "NRI" },
];

const BankDetails: React.FC<BankDetailsProps> = ({
  formData,
  errors,
  onFieldChange,
  onFieldFocus,
}) => {
  const optionalLabel = (label: string) => (
    <span>
      {label}{" "}
      <span style={{ fontWeight: "normal", fontSize: "0.75rem", color: "#666" }}>
        (Optional)
      </span>
    </span>
  );

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>) => {
    const syntheticEvent = {
      target: {
        name: event.target.name,
        value: event.target.value,
      },
    } as React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>;
    onFieldChange(syntheticEvent);
  }, [onFieldChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(e);
  }, [onFieldChange]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<InfoIcon />}>
          <AlertTitle>Bank Details</AlertTitle>
          Bank details are optional but recommended for payment processing.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder="Enter bank name"
          name="bankName"
          fullWidth
          value={formData.bankName}
          onChange={handleInputChange}
          onFocus={() => onFieldFocus && onFieldFocus("bankName")}
          error={!!errors.bankName}
          helperText={errors.bankName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BankIcon color="action" />
              </InputAdornment>
            ),
          }}
          label={optionalLabel("Bank Name")}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder="Enter account holder name"
          name="accountHolderName"
          fullWidth
          value={formData.accountHolderName}
          onChange={handleInputChange}
          onFocus={() => onFieldFocus && onFieldFocus("accountHolderName")}
          error={!!errors.accountHolderName}
          helperText={errors.accountHolderName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
          label={optionalLabel("Account Holder Name")}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder="Enter account number"
          name="accountNumber"
          fullWidth
          value={formData.accountNumber}
          onChange={handleInputChange}
          onFocus={() => onFieldFocus && onFieldFocus("accountNumber")}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber}
          inputProps={{ maxLength: 20, inputMode: "numeric", pattern: "[0-9]*" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CardIcon color="action" />
              </InputAdornment>
            ),
          }}
          label={optionalLabel("Account Number")}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder="Enter IFSC code (e.g., SBIN0001234)"
          name="ifscCode"
          fullWidth
          value={formData.ifscCode}
          onChange={handleInputChange}
          onFocus={() => onFieldFocus && onFieldFocus("ifscCode")}
          error={!!errors.ifscCode}
          helperText={errors.ifscCode}
          inputProps={{ maxLength: 11, style: { textTransform: "uppercase" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CodeIcon color="action" />
              </InputAdornment>
            ),
          }}
          label={optionalLabel("IFSC Code")}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.accountType}>
          <FormLabel htmlFor="account-type-select" sx={{ mb: 1 }}>
            {optionalLabel("Account Type")}
          </FormLabel>
          <Select
            id="account-type-select"
            name="accountType"
            value={formData.accountType}
            onChange={handleSelectChange}
            onFocus={() => onFieldFocus && onFieldFocus("accountType")}
            displayEmpty
            startAdornment={
              <InputAdornment position="start">
                <CardIcon color="action" sx={{ mr: 1 }} />
              </InputAdornment>
            }
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: "#999" }}>Select account type</span>;
              }
              return accountTypes.find((type) => type.value === selected)?.label || selected;
            }}
          >
            <MenuItem value="" disabled>
              Select account type
            </MenuItem>
            {accountTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          {errors.accountType && <FormHelperText>{errors.accountType}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder="Enter UPI ID (e.g., username@bankname)"
          name="upiId"
          fullWidth
          value={formData.upiId}
          onChange={handleInputChange}
          onFocus={() => onFieldFocus && onFieldFocus("upiId")}
          error={!!errors.upiId}
          helperText={errors.upiId}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PaymentIcon color="action" />
              </InputAdornment>
            ),
          }}
          label={optionalLabel("UPI ID")}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12}>
        <Alert severity="info" icon={<InfoIcon />} sx={{ bgcolor: "#f5f5f5", color: "#666" }}>
          <Typography variant="caption">
            All bank details are optional. You can add or update them later from your profile settings.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};

export default BankDetails;