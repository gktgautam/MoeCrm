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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
 
export interface ProductCreateDialogProps {
 open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void> | void;
}

// -----------------------------
// Validation Schema (login-page style: no transforms/coercions)
// -----------------------------
const BrandingSchema = z.object({
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

const ProductCreateSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  defaultEmailSenderId: z.number().int().nonnegative().nullable(),
  emailHeaderHtml: z.string().optional(),
  emailFooterHtml: z.string().optional(),
  branding: BrandingSchema,
});

type ProductCreateValues = z.infer<typeof ProductCreateSchema>;

export const ProductCreateDialog: React.FC<ProductCreateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [openBranding, setOpenBranding] = useState(false);

  const form = useForm<ProductCreateValues>({
    resolver: zodResolver(ProductCreateSchema),
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

  const nullify = (v: any) => (v === "" ? null : v);

  const onValid = async (values: ProductCreateValues) => {
    // Keep it like your original: empty strings -> null for backend SQL consistency
    const payload = {
      ...values,
      defaultEmailSenderId: nullify(values.defaultEmailSenderId),
      emailHeaderHtml: nullify(values.emailHeaderHtml ?? ""),
      emailFooterHtml: nullify(values.emailFooterHtml ?? ""),
      branding: openBranding
        ? Object.fromEntries(
            Object.entries(values.branding).map(([k, v]) => [
              k,
              k === "isActive" ? v : nullify(v),
            ])
          )
        : undefined,
    };

    await onSubmit(payload);

        // close on success
    onOpenChange(false);

    // optional: reset for next open
    form.reset();
    setOpenBranding(false);
  };


 const handleCancel = () => {
    onOpenChange(false);
    form.reset();
    setOpenBranding(false);
  };
 
  return (
   <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new product.
          </DialogDescription>
        </DialogHeader>

      <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Create Product</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onValid)} className="space-y-6">
              {/* ------------------------
                  Basic Product Fields
              ------------------------- */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="Acme Pro" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  minLength={1}
                  className="min-h-[80px]"
                  placeholder="What does this product do?"
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* ------------------------
                  Email Settings
              ------------------------- */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Settings (Defaults)</h3>

                <div className="space-y-2">
                  <Label htmlFor="defaultEmailSenderId">Default Email Sender ID</Label>
                  <Input
                    id="defaultEmailSenderId"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 123"
                    {...form.register("defaultEmailSenderId", {
                      // login-page style fix: do parsing here, NOT in zod
                      setValueAs: (v) => (v === "" ? null : Number(v)),
                    })}
                  />
                  {form.formState.errors.defaultEmailSenderId && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.defaultEmailSenderId.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailHeaderHtml">Email Header HTML</Label>
                  <Textarea
                    id="emailHeaderHtml"
                    className="min-h-[80px] font-mono"
                    placeholder="<div>...</div>"
                    {...form.register("emailHeaderHtml")}
                  />
                  {form.formState.errors.emailHeaderHtml && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.emailHeaderHtml.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFooterHtml">Email Footer HTML</Label>
                  <Textarea
                    id="emailFooterHtml"
                    className="min-h-[80px] font-mono"
                    placeholder="<div>...</div>"
                    {...form.register("emailFooterHtml")}
                  />
                  {form.formState.errors.emailFooterHtml && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.emailFooterHtml.message as string}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* ------------------------
                  Branding Section
              ------------------------- */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Branding (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenBranding((s) => !s)}
                >
                  {openBranding ? "Hide" : "Add Branding"}
                </Button>
              </div>

              <Collapsible open={openBranding} onOpenChange={setOpenBranding}>
                <CollapsibleContent className="space-y-4">
                  {(
                    [
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
                    ] as const
                  ).map(([field, label]) => {
                    const isAddress = field === "addressText";
                    return (
                      <div className="space-y-2" key={field}>
                        <Label htmlFor={field}>{label}</Label>
                        {isAddress ? (
                          <Textarea
                            id={field}
                            className="min-h-[80px]"
                            {...form.register(`branding.${field}`)}
                          />
                        ) : (
                          <Input id={field} {...form.register(`branding.${field}`)} />
                        )}
                        {/* Optional fields: no error messages by default */}
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Branding Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle whether branding is active.
                      </p>
                    </div>

                    <Switch
                      checked={form.watch("branding.isActive")}
                      onCheckedChange={(checked) =>
                        form.setValue("branding.isActive", checked, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

                 {/* ------------------------
                    Actions
                ------------------------- */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="font-bold"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Creating..." : "Create Product"}
                  </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>

      </DialogContent>
    </Dialog>
  );
};