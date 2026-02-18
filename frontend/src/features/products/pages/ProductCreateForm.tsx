import { useState } from "react";
import {
  TextField,
  Button,
  Collapse,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";

export interface ProductCreateFormProps {
  onSubmit: (data: any) => Promise<void> | void;
}

export const ProductCreateForm: React.FC<ProductCreateFormProps> = ({ onSubmit }) => {
  const [openBranding, setOpenBranding] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    defaultEmailSenderId: null as number | null,
    emailHeaderHtml: "",
    emailFooterHtml: "",
    branding: {
      displayName: "",
      websiteUrl: "",
      trackingDomain: "",
      senderDomain: "",
      logoUrl: "",
      faviconUrl: "",
      brandColor: "",
      supportEmail: "",
      addressText: "",
      privacyPolicyUrl: "",
      termsUrl: "",
      unsubscribeUrl: "",
      isActive: true,
    },
  });

  const update = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const updateBrand = (field: string, value: any) =>
    setForm((f) => ({ ...f, branding: { ...f.branding, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Converts empty string "" → null for backend SQL consistency
    const nullify = (v: any) => (v === "" ? null : v);

    const payload = {
      ...form,
      defaultEmailSenderId: nullify(form.defaultEmailSenderId),
      emailHeaderHtml: nullify(form.emailHeaderHtml),
      emailFooterHtml: nullify(form.emailFooterHtml),
      branding: openBranding
        ? Object.fromEntries(
            Object.entries(form.branding).map(([k, v]) => [k, nullify(v)])
          )
        : undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto space-y-6 p-6"
    >
      <Paper className="p-6 space-y-6 shadow-md">
        <h2 className="text-2xl font-semibold">Create Product</h2>

        {/* ------------------------
            Basic Product Fields
        ------------------------- */}
        <TextField
          label="Product Name"
          fullWidth
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          required
          multiline
          minRows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />

        <Divider />

        {/* ------------------------
            Email Settings
        ------------------------- */}
        <h3 className="text-xl font-medium">Email Settings (Defaults)</h3>

        <TextField
          label="Default Email Sender ID"
          fullWidth
          type="number"
          value={form.defaultEmailSenderId ?? ""}
          onChange={(e) =>
            update(
              "defaultEmailSenderId",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        />

        <TextField
          label="Email Header HTML"
          fullWidth
          multiline
          minRows={2}
          value={form.emailHeaderHtml}
          onChange={(e) => update("emailHeaderHtml", e.target.value)}
        />

        <TextField
          label="Email Footer HTML"
          fullWidth
          multiline
          minRows={2}
          value={form.emailFooterHtml}
          onChange={(e) => update("emailFooterHtml", e.target.value)}
        />

        <Divider />

        {/* ------------------------
            Branding Section
        ------------------------- */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Branding (Optional)</h3>
          <Button onClick={() => setOpenBranding(!openBranding)}>
            {openBranding ? "Hide" : "Add Branding"}
          </Button>
        </div>

        <Collapse in={openBranding}>
          <div className="mt-4 space-y-4">
            {[
              ["displayName", "Display Name"],
              ["websiteUrl", "Website URL"],
              ["trackingDomain", "Tracking Domain"],
              ["senderDomain", "Sender Domain"],
              ["logoUrl", "Logo URL"],
              ["faviconUrl", "Favicon URL"],
              ["brandColor", "Brand Color"],
              ["supportEmail", "Support Email"],
              ["addressText", "Address Text"],
              ["privacyPolicyUrl", "Privacy Policy URL"],
              ["termsUrl", "Terms URL"],
              ["unsubscribeUrl", "Unsubscribe URL"],
            ].map(([field, label]) => (
              <TextField
                key={field}
                label={label}
                fullWidth
                multiline={field === "addressText"}
                minRows={field === "addressText" ? 2 : undefined}
                value={(form.branding as any)[field]}
                onChange={(e) => updateBrand(field, e.target.value)}
              />
            ))}

            <FormControlLabel
              control={
                <Switch
                  checked={form.branding.isActive}
                  onChange={(e) => updateBrand("isActive", e.target.checked)}
                />
              }
              label="Branding Active"
            />
          </div>
        </Collapse>

        <Divider />

        {/* ------------------------
            Submit Button
        ------------------------- */}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          className="!mt-4"
        >
          Create Product
        </Button>
      </Paper>
    </form>
  );
};
