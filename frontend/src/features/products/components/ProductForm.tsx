import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import type { ProductCreateInput } from "../products.types";

const brandingSchema = z.object({
  displayName: z.string().optional(),
  websiteUrl: z.string().optional(),
  trackingDomain: z.string().optional(),
  senderDomain: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  brandColor: z.string().optional(),
  supportEmail: z.string().optional(),
  addressText: z.string().optional(),
  privacyPolicyUrl: z.string().optional(),
  termsUrl: z.string().optional(),
  unsubscribeUrl: z.string().optional(),
  isActive: z.boolean(),
});

const productCreateSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  defaultEmailSenderId: z.number().int().nonnegative().nullable(),
  emailHeaderHtml: z.string().optional(),
  emailFooterHtml: z.string().optional(),
  branding: brandingSchema,
});

type ProductCreateValues = z.infer<typeof productCreateSchema>;

type ProductFormProps = {
  onSubmit: (data: ProductCreateInput) => Promise<void> | void;
  onCancel: () => void;
};

export function ProductForm({ onSubmit, onCancel }: ProductFormProps) {
  const [openBranding, setOpenBranding] = useState(false);

  const form = useForm<ProductCreateValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultEmailSenderId: null,
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
    },
  });

  const nullify = (value: string | number | null | undefined) =>
    value === "" || value === undefined ? null : value;

  const onValid = async (values: ProductCreateValues) => {
    const payload: ProductCreateInput = {
      ...values,
      defaultEmailSenderId: nullify(values.defaultEmailSenderId) as number | null,
      emailHeaderHtml: nullify(values.emailHeaderHtml) as string | null,
      emailFooterHtml: nullify(values.emailFooterHtml) as string | null,
      branding: openBranding
        ? {
            ...values.branding,
            displayName: nullify(values.branding.displayName) as string | null,
            websiteUrl: nullify(values.branding.websiteUrl) as string | null,
            trackingDomain: nullify(values.branding.trackingDomain) as string | null,
            senderDomain: nullify(values.branding.senderDomain) as string | null,
            logoUrl: nullify(values.branding.logoUrl) as string | null,
            faviconUrl: nullify(values.branding.faviconUrl) as string | null,
            brandColor: nullify(values.branding.brandColor) as string | null,
            supportEmail: nullify(values.branding.supportEmail) as string | null,
            addressText: nullify(values.branding.addressText) as string | null,
            privacyPolicyUrl: nullify(values.branding.privacyPolicyUrl) as string | null,
            termsUrl: nullify(values.branding.termsUrl) as string | null,
            unsubscribeUrl: nullify(values.branding.unsubscribeUrl) as string | null,
          }
        : undefined,
    };

    await onSubmit(payload);
    form.reset();
    setOpenBranding(false);
  };

  const handleCancel = () => {
    form.reset();
    setOpenBranding(false);
    onCancel();
  };

  return (
    <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" placeholder="e.g., SaaS Platform" {...form.register("name")} />
        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" className="min-h-[80px]" placeholder="What does this product do?" {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="defaultEmailSenderId">Default Email Sender ID</Label>
        <Input
          id="defaultEmailSenderId"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 123"
          {...form.register("defaultEmailSenderId", {
            setValueAs: (value: string) => (value === "" ? null : Number(value)),
          })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailHeaderHtml">Email Header HTML</Label>
        <Textarea id="emailHeaderHtml" className="min-h-[80px] font-mono" placeholder="<div>...</div>" {...form.register("emailHeaderHtml")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailFooterHtml">Email Footer HTML</Label>
        <Textarea id="emailFooterHtml" className="min-h-[80px] font-mono" placeholder="<div>...</div>" {...form.register("emailFooterHtml")} />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Branding (Optional)</h3>
        <Button type="button" variant="outline" onClick={() => setOpenBranding((state) => !state)}>
          {openBranding ? "Hide" : "Add Branding"}
        </Button>
      </div>

      <Collapsible open={openBranding} onOpenChange={setOpenBranding}>
        <CollapsibleContent className="space-y-4">
          {([
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
          ] as const).map(([field, label]) => {
            const isAddress = field === "addressText";
            return (
              <div className="space-y-2" key={field}>
                <Label htmlFor={field}>{label}</Label>
                {isAddress ? (
                  <Textarea id={field} className="min-h-[80px]" {...form.register(`branding.${field}`)} />
                ) : (
                  <Input id={field} {...form.register(`branding.${field}`)} />
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Branding Active</Label>
              <p className="text-sm text-muted-foreground">Toggle whether branding is active.</p>
            </div>

            <Switch
              checked={form.watch("branding.isActive")}
              onCheckedChange={(checked: boolean) => {
                form.setValue("branding.isActive", checked, { shouldDirty: true, shouldTouch: true });
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" className="font-bold" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
