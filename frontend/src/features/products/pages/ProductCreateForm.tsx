import { useState } from "react";

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
      {/* Card / Paper */}
      <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold">Create Product</h2>

        {/* ------------------------
            Basic Product Fields
        ------------------------- */}
        <Input
          label="Product Name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <Textarea
          label="Description"
          required
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />

        <Divider />

        {/* ------------------------
            Email Settings
        ------------------------- */}
        <h3 className="text-xl font-medium">Email Settings (Defaults)</h3>

        <Input
          type="number"
          label="Default Email Sender ID"
          value={form.defaultEmailSenderId ?? ""}
          onChange={(e) =>
            update(
              "defaultEmailSenderId",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        />

        <Textarea
          label="Email Header HTML"
          value={form.emailHeaderHtml}
          onChange={(e) => update("emailHeaderHtml", e.target.value)}
        />

        <Textarea
          label="Email Footer HTML"
          value={form.emailFooterHtml}
          onChange={(e) => update("emailFooterHtml", e.target.value)}
        />

        <Divider />

        {/* ------------------------
            Branding Section
        ------------------------- */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Branding (Optional)</h3>

          <button
            type="button"
            onClick={() => setOpenBranding(!openBranding)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition"
          >
            {openBranding ? "Hide" : "Add Branding"}
          </button>
        </div>

        {/* COLLAPSE */}
        <div
          className={`transition-all overflow-hidden ${
            openBranding ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 space-y-4 pt-2">
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
              <div key={field}>
                {field === "addressText" ? (
                  <Textarea
                    label={label}
                    value={(form.branding as any)[field]}
                    onChange={(e) => updateBrand(field, e.target.value)}
                  />
                ) : (
                  <Input
                    label={label}
                    value={(form.branding as any)[field]}
                    onChange={(e) => updateBrand(field, e.target.value)}
                  />
                )}
              </div>
            ))}

            {/* Switch */}
            <ToggleSwitch
              label="Branding Active"
              checked={form.branding.isActive}
              onChange={(checked) => updateBrand("isActive", checked)}
            />
          </div>
        </div>

        <Divider />

        {/* ------------------------
            Submit Button
        ------------------------- */}
        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          Create Product
        </button>
      </div>
    </form>
  );
};

/* -----------------------------------------------
   Small Tailwind Reusable Components
------------------------------------------------ */

function Input({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none border-gray-300 ${className}`}
      />
    </div>
  );
}

function Textarea({
  label,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        {...props}
        className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none border-gray-300 min-h-[80px] ${className}`}
      />
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-200 my-4" />;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition"></div>
        <div className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full shadow transition peer-checked:translate-x-5"></div>
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}
