import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "./ProductForm";
import type { ProductCreateInput } from "../products.types";

type ProductCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductCreateInput) => Promise<void>;
};

export function ProductCreateDialog({ open, onOpenChange, onSubmit }: ProductCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>Fill in the details below to create a new product.</DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Create Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
