import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  X,
  CalendarRange,
  Briefcase,
  UserCog,
  AlertCircle,
  FileBadge,
  Sparkles,
} from "lucide-react";
import paymentInstance from "src/services/paymentInstance";

export type EngagementFormInitial = {
  engagement_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  task_status: string;
  service_type: string;
  booking_type: string;
  base_amount: string;
  active: boolean;
  serviceproviderid: string;
  contextProviderId: number;
};

const emptyForm = (id: number): EngagementFormInitial => ({
  engagement_id: id,
  start_date: "",
  end_date: "",
  start_time: "09:00",
  task_status: "NOT_STARTED",
  service_type: "",
  booking_type: "",
  base_amount: "",
  active: true,
  serviceproviderid: "",
  contextProviderId: 0,
});

function SectionBlock(props: {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  accent?: "violet" | "amber" | "slate";
}) {
  const { title, subtitle, icon, children, accent = "violet" } = props;
  const theme = useTheme();
  const c =
    accent === "amber" ? theme.palette.warning.main : accent === "slate" ? theme.palette.text.secondary : theme.palette.primary.main;
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: (t) => alpha(t.palette.divider, 0.8),
        overflow: "hidden",
        background: (t) =>
          t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.4) : alpha(t.palette.background.paper, 0.95),
      }}
    >
      <Box
        sx={(t) => ({
          px: 2,
          py: 1.5,
          borderLeft: 4,
          borderColor: c,
          bgcolor: alpha(c, 0.06),
        })}
      >
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Box
            sx={() => ({
              display: "flex",
              h: 36,
              w: 36,
              minWidth: 36,
              borderRadius: 1.25,
              alignItems: "center",
              justifyContent: "center",
              color: c,
              bgcolor: alpha(c, 0.12),
            })}
            aria-hidden
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2, fontWeight: 800, letterSpacing: "0.1em" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.45 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2, pt: 0 }}>{children}</Box>
    </Paper>
  );
}

export function EngagementEditDialog(props: {
  open: boolean;
  onClose: () => void;
  initial: EngagementFormInitial | null;
  onSaved?: () => void;
}) {
  const { open, onClose, initial, onSaved } = props;
  const theme = useTheme();
  const [form, setForm] = useState<EngagementFormInitial>(emptyForm(0));
  const [adminName, setAdminName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    if (!saving) {
      setErrorMsg(null);
      onClose();
    }
  }, [saving, onClose]);

  useEffect(() => {
    if (open && initial) {
      setForm({ ...initial });
      setAdminName("");
      setAdminId("");
      setErrorMsg(null);
    }
  }, [open, initial]);

  const save = async () => {
    if (!initial) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const body: Record<string, unknown> = {
        modified_by_role: "ADMIN",
      };
      const f = form;
      if (f.start_date) body.start_date = f.start_date;
      if (f.end_date) body.end_date = f.end_date;
      if (f.start_time) body.start_time = f.start_time;
      if (f.task_status) body.task_status = f.task_status;
      if (f.service_type) body.service_type = f.service_type;
      if (f.booking_type) body.booking_type = f.booking_type;
      if (f.base_amount !== "") body.base_amount = Number(f.base_amount);
      body.active = f.active;
      if (f.serviceproviderid.trim() !== "" && /^\d+$/.test(f.serviceproviderid.trim())) {
        const newId = Number(f.serviceproviderid.trim());
        if (newId !== initial.contextProviderId) {
          body.serviceproviderid = newId;
        }
      }
      if (adminName.trim()) {
        body.modified_by_name = adminName.trim();
        body.source = "ADMIN_PORTAL";
      }
      if (adminId.trim() && /^\d+$/.test(adminId.trim())) {
        body.modified_by_id = Number(adminId.trim());
      }
      await paymentInstance.put(`/api/engagements/${initial.engagement_id}`, body);
      onClose();
      onSaved?.();
    } catch (e) {
      const err = e as { response?: { data?: { error?: string; detail?: string; message?: string } } };
      const msg =
        err?.response?.data?.error || err?.response?.data?.detail || err?.response?.data?.message || "Failed to update engagement";
      setErrorMsg(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_e, reason) => {
          if (reason === "backdropClick" && saving) return;
          handleClose();
        }}
        maxWidth="md"
        fullWidth
        scroll="body"
        TransitionComponent={Fade}
        transitionDuration={200}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: alpha("#0f172a", 0.5) },
          },
          paper: {
            elevation: 24,
            sx: (th) => ({
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${alpha(th.palette.divider, 0.85)}`,
              maxHeight: "min(90vh, 800px)",
              display: "flex",
              flexDirection: "column",
            }),
          },
        }}
        aria-labelledby="engagement-dialog-title"
      >
        <DialogTitle
          id="engagement-dialog-title"
          component="div"
          sx={() => ({
            p: 0,
            background: `linear-gradient(128deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
              "#7c3aed",
              0.05
            )} 50%, #fff 100%)`,
            borderBottom: 1,
            borderColor: "divider",
          })}
        >
          <Box sx={{ px: 2.5, py: 2, pr: 1 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
              <Stack direction="row" alignItems="flex-start" gap={1.5} minWidth={0} flex={1}>
                <Box
                  sx={{
                    w: 48,
                    h: 48,
                    minWidth: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                  }}
                  aria-hidden
                >
                  <Sparkles size={26} strokeWidth={1.4} />
                </Box>
                <Box minWidth={0} flex={1}>
                  <Typography component="h2" variant="h6" fontWeight={800} letterSpacing="-0.02em" sx={{ lineHeight: 1.25 }}>
                    Update engagement
                  </Typography>
                  {initial && (
                    <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} useFlexGap sx={{ mt: 0.75 }}>
                      <Chip size="small" color="primary" label={`#${initial.engagement_id}`} variant="outlined" />
                      {initial.contextProviderId === 0 && (
                        <Chip size="small" color="warning" label="Unassigned" variant="filled" sx={{ fontWeight: 700 }} />
                      )}
                    </Stack>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                    Changes are validated on the server (overlap, wallets, and booking rules). Only what you need to
                    change has to be filled.
                  </Typography>
                </Box>
              </Stack>
              <IconButton
                onClick={handleClose}
                aria-label="Close"
                size="small"
                disabled={saving}
                sx={{ color: "text.secondary", "&:hover": { color: "text.primary", bgcolor: (t) => alpha(t.palette.text.primary, 0.06) } }}
              >
                <X className="h-5 w-5" />
              </IconButton>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            flex: 1,
            overflow: "auto",
            px: 2.5,
            py: 2.5,
            bgcolor: (th) => alpha(th.palette.text.primary, 0.01),
            borderTop: "none",
            borderColor: "divider",
          }}
        >
          {initial && (
            <Stack spacing={2.25}>
              {initial.contextProviderId === 0 && (
                <Alert severity="warning" variant="outlined" icon={<AlertCircle className="h-5 w-5" />} sx={{ borderRadius: 2 }}>
                  This engagement has <strong>no service provider</strong> yet. Enter a provider id below to assign, or
                  use the same form to reassign.
                </Alert>
              )}

              <SectionBlock
                title="Schedule"
                subtitle="Date range and daily start time in IST. Server recalculates time windows when you save."
                icon={<CalendarRange size={19} strokeWidth={1.75} />}
                accent="violet"
              >
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 0.5 }}>
                  <TextField
                    label="Start date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    disabled={saving}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                  <TextField
                    label="End date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    disabled={saving}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                  <TextField
                    label="Start time (IST)"
                    value={form.start_time}
                    onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                    size="small"
                    fullWidth
                    placeholder="HH:mm"
                    disabled={saving}
                    helperText="Use 24h, e.g. 09:00, 14:30"
                    sx={{ gridColumn: { xs: "1", sm: "span 2" }, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                </Box>
              </SectionBlock>

              <SectionBlock
                title="Service & status"
                subtitle="Task progress and the commercial / booking classification."
                icon={<Briefcase size={19} strokeWidth={1.75} />}
                accent="slate"
              >
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 0.5 }}>
                  <FormControl fullWidth size="small" disabled={saving} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}>
                    <InputLabel id="eng-task">Task status</InputLabel>
                    <Select
                      labelId="eng-task"
                      value={form.task_status}
                      label="Task status"
                      onChange={(e) => setForm((f) => ({ ...f, task_status: e.target.value }))}
                    >
                      {["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "HOLD"].map((x) => (
                        <MenuItem key={x} value={x}>
                          {x}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Service type"
                    value={form.service_type}
                    onChange={(e) => setForm((f) => ({ ...f, service_type: e.target.value }))}
                    size="small"
                    fullWidth
                    disabled={saving}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                  <TextField
                    label="Booking type"
                    value={form.booking_type}
                    onChange={(e) => setForm((f) => ({ ...f, booking_type: e.target.value }))}
                    size="small"
                    fullWidth
                    disabled={saving}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                  <TextField
                    label="Base amount"
                    value={form.base_amount}
                    onChange={(e) => setForm((f) => ({ ...f, base_amount: e.target.value }))}
                    size="small"
                    type="number"
                    fullWidth
                    disabled={saving}
                    inputProps={{ min: 0, step: 0.01 }}
                    slotProps={{ htmlInput: { "aria-label": "Base amount" } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                </Box>
              </SectionBlock>

              <SectionBlock
                title="Provider & audit"
                subtitle="Assigning changes who gets paid; audit fields are stored with the modification log."
                icon={<UserCog size={19} strokeWidth={1.75} />}
                accent="amber"
              >
                <Stack spacing={1.5} pt={0.5}>
                  <TextField
                    label="Service provider id"
                    value={form.serviceproviderid}
                    onChange={(e) => setForm((f) => ({ ...f, serviceproviderid: e.target.value }))}
                    size="small"
                    fullWidth
                    disabled={saving}
                    helperText={
                      initial?.contextProviderId
                        ? `Current provider id: ${initial.contextProviderId}. Change only to reassign.`
                        : "Type the numeric id to assign this job to a provider."
                    }
                    inputProps={{ inputMode: "numeric" }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                  />
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderStyle: "dashed",
                      borderColor: (t) => alpha(t.palette.divider, 0.9),
                      bgcolor: (t) => alpha(t.palette.background.paper, 0.6),
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      flexWrap="wrap"
                      useFlexGap
                      spacing={1.5}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={form.active}
                            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                            disabled={saving}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              Engagement is active
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.15 }}>
                              Turn off for cancel/hold on your internal workflow (server rules still apply).
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
                      />
                    </Stack>
                  </Paper>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1.5}
                    alignItems="stretch"
                  >
                    <TextField
                      label="Admin name (for audit log)"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      size="small"
                      fullWidth
                      disabled={saving}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ pl: 0.5, "& .MuiTypography-root": { m: 0 } }}>
                            <FileBadge className="h-4 w-4 text-slate-400" aria-hidden />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, minWidth: 0, maxWidth: { sm: 320 }, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                    />
                    <TextField
                      label="Admin user id"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      type="number"
                      size="small"
                      disabled={saving}
                      sx={{ width: { xs: "100%", sm: 200 }, flexShrink: 0, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: (t) => t.palette.background.paper } }}
                    />
                  </Stack>
                </Stack>
              </SectionBlock>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 2.5,
            py: 1.75,
            gap: 1,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: (t) => alpha(t.palette.text.primary, 0.02),
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 120, alignSelf: "center" }}>
            {saving ? "Saving…" : "Esc to cancel when not saving"}
          </Typography>
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={saving}
            variant="outlined"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2, borderColor: "divider" }}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            variant="contained"
            disabled={saving}
            size="large"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 2.5, minWidth: 128, boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
            type="button"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        autoHideDuration={10000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)} icon={<AlertCircle className="h-5 w-5" />} sx={{ maxWidth: 480 }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
