/* eslint-disable */
import React from "react";
import {
  Grid,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
} from "@mui/icons-material";
import { CheckIcon } from "lucide-react";
import moment from "moment";
import ProfileImageUpload from "./ProfileImageUpload";
import { useLanguage } from "src/context/LanguageContext";


interface BasicInformationProps {
  formData: any;
  errors: any;
  validationResults: any;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isDobValid: boolean;
  onImageSelect: (file: Blob | null) => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldFocus: (fieldName: string) => void;
  onDobChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onClearEmail: () => void;
  onClearMobile: () => void;
  onClearAlternate: () => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  errors,
  validationResults,
  showPassword,
  showConfirmPassword,
  isDobValid,
  onImageSelect,
  onFieldChange,
  onFieldFocus,
  onDobChange,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onClearEmail,
  onClearMobile,
  onClearAlternate,
}) => {
  const { t } = useLanguage(); // Use the language context
  const MAX_NAME_LENGTH = 30;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <ProfileImageUpload onImageSelect={onImageSelect} />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("firstNamePlaceholder")}
          name="firstName"
          fullWidth
          required
          value={formData.firstName}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName}
          inputProps={{ maxLength: MAX_NAME_LENGTH }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("middleNamePlaceholder")}
          name="middleName"
          fullWidth
          value={formData.middleName}
          onChange={onFieldChange}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("lastNamePlaceholder")}
          name="lastName"
          fullWidth
          required
          value={formData.lastName}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName}
          inputProps={{ maxLength: MAX_NAME_LENGTH }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          label={t("dobLabel")}
          name="dob"
          type="date"
          fullWidth
          required
          value={formData.dob}
          onChange={onDobChange}
          error={!!errors.dob}
          helperText={errors.dob || t("dobHelperText")}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: moment().subtract(18, 'years').format('YYYY-MM-DD')
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl component="fieldset" error={!!errors.gender}>
          <FormLabel component="legend">{t("genderLabel")}</FormLabel>
          <RadioGroup row name="gender" value={formData.gender} onChange={onFieldChange}>
            <FormControlLabel value="MALE" control={<Radio />} label={t("male")} />
            <FormControlLabel value="FEMALE" control={<Radio />} label={t("female")} />
            <FormControlLabel value="OTHER" control={<Radio />} label={t("other")} />
          </RadioGroup>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("emailPlaceholder")}
          name="emailId"
          fullWidth
          required
          value={formData.emailId}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("emailId")}
          error={!!errors.emailId || validationResults.email.isAvailable === false}
          helperText={
            errors.emailId ||
            (validationResults.email.loading ? t("checkingAvailability") :
              validationResults.email.error ||
              (validationResults.email.isAvailable ? t("emailAvailable") : ""))
          }
          InputProps={{
            endAdornment: validationResults.email.loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : validationResults.email.isAvailable ? (
              <InputAdornment position="end">
                <CheckIcon color="success" />
              </InputAdornment>
            ) : validationResults.email.isAvailable === false ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClearEmail} edge="end">
                  <CloseIcon color="error" fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("passwordPlaceholder")}
          type={showPassword ? "text" : "password"}
          name="password"
          fullWidth
          required
          value={formData.password}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("password")}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onTogglePasswordVisibility} edge="end">
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("confirmPasswordPlaceholder")}
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          fullWidth
          required
          value={formData.confirmPassword}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={onToggleConfirmPasswordVisibility} edge="end">
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          placeholder={t("mobilePlaceholder")}
          name="mobileNo"
          fullWidth
          required
          value={formData.mobileNo}
          onChange={onFieldChange}
          onFocus={() => onFieldFocus("mobileNo")}
          error={!!errors.mobileNo || validationResults.mobile.isAvailable === false}
          helperText={
            errors.mobileNo ||
            (validationResults.mobile.loading ? t("checkingAvailability") :
              validationResults.mobile.error ||
              (validationResults.mobile.isAvailable ? t("mobileAvailable") : ""))
          }
          InputProps={{
            endAdornment: validationResults.mobile.loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : validationResults.mobile.isAvailable ? (
              <InputAdornment position="end">
                <CheckIcon color="success" />
              </InputAdornment>
            ) : validationResults.mobile.isAvailable === false ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClearMobile} edge="end">
                  <CloseIcon color="error" fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          placeholder={t("alternatePlaceholder")}
          name="AlternateNumber"
          fullWidth
          value={formData.AlternateNumber}
          onChange={onFieldChange}
          error={!!errors.AlternateNumber || validationResults.alternate.isAvailable === false}
          helperText={
            errors.AlternateNumber ||
            (validationResults.alternate.loading ? t("checkingAvailability") :
              validationResults.alternate.error ||
              (validationResults.alternate.isAvailable ? t("alternateAvailable") : ""))
          }
          InputProps={{
            endAdornment: validationResults.alternate.loading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : validationResults.alternate.isAvailable ? (
              <InputAdornment position="end">
                <CheckIcon color="success" />
              </InputAdornment>
            ) : validationResults.alternate.isAvailable === false ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClearAlternate} edge="end">
                  <CloseIcon color="error" fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInformation;