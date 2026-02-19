import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// helpers: convert "" -> undefined so optional url/email fields validate nicely
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const brandingSchema = z.object({
  displayName: optionalString,
  websiteUrl: optionalUrl,
  trackingDomain: optionalString,
  senderDomain: optionalString,
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  brandColor: optionalString,
  supportEmail: optionalEmail,
  addressText: optionalString,
  privacyPolicyUrl: optionalUrl,
  termsUrl: optionalUrl,
  unsubscribeUrl: optionalUrl,
  isActive: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  defaultEmailSenderId: z.number().nullable().optional(),
  emailHeaderHtml: z.string().nullable().optional(),
  emailFooterHtml: z.string().nullable().optional(),
  branding: brandingSchema.optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const ProductCreateForm = ({
  onSubmit,
}: {
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
}) => {
  const [openBranding, setOpenBranding] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultEmailSenderId: null,
      emailHeaderHtml: null,
      emailFooterHtml: null,
      branding: {
        // keep these as "" so inputs are easy to work with
        // preprocessors will turn "" into undefined at validation time
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

  const handleSubmit = async (values: ProductFormValues) => {
    const payload: ProductFormValues = {
      ...values,
      branding: openBranding ? values.branding : undefined,
    };
    await onSubmit(payload);
  };

  const brandingFields: Array<
    { key: Exclude<keyof NonNullable<ProductFormValues["branding"]>, "isActive">; label: string; type?: "textarea" }
  > = [
    { key: "displayName", label: "Display Name" },
    { key: "websiteUrl", label: "Website URL" },
    { key: "trackingDomain", label: "Tracking Domain" },
    { key: "senderDomain", label: "Sender Domain" },
    { key: "logoUrl", label: "Logo URL" },
    { key: "faviconUrl", label: "Favicon URL" },
    { key: "brandColor", label: "Brand Color" },
    { key: "supportEmail", label: "Support Email" },
    { key: "addressText", label: "Address Text", type: "textarea" },
    { key: "privacyPolicyUrl", label: "Privacy Policy URL" },
    { key: "termsUrl", label: "Terms URL" },
    { key: "unsubscribeUrl", label: "Unsubscribe URL" },
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full max-w-3xl mx-auto space-y-6 p-6">
      <Card className="space-y-6">
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr />

          <h3 className="text-xl font-medium">Email Settings (Defaults)</h3>

          <FormField
            control={form.control}
            name="defaultEmailSenderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Email Sender ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailHeaderHtml"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Header HTML</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={2} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailFooterHtml"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Footer HTML</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={2} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr />

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Branding (Optional)</h3>
            <Button type="button" variant="outline" onClick={() => setOpenBranding((v) => !v)}>
              {openBranding ? "Hide" : "Add Branding"}
            </Button>
          </div>

          <Collapsible open={openBranding}>
            <CollapsibleContent>
              <div className="mt-4 space-y-4">
                {brandingFields.map(({ key, label, type }) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`branding.${key}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          {type === "textarea" ? (
                            <Textarea {...field} rows={2} className="resize-none" />
                          ) : (
                            <Input {...field} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={form.control}
                  name="branding.isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="mb-0">Branding Active</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <hr />

          <Button type="submit" className="mt-4 w-full">
            Create Product
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
