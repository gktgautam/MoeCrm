import { Button, Card, CardContent, TextField } from "@mui/material";


export default function Demo() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 border-b border-border bg-surface/80 backdrop-blur p-4 flex items-center justify-between">
        <div className="font-semibold">EqueEngage</div>
       </header>

      <main className="p-6">
        <div className="max-w-xl rounded-[--radius-lg] bg-surface border border-border shadow-[--shadow-md] p-6">
          <div className="text-muted">Tailwind tokens drive everything</div>

          <div className="mt-4 flex gap-3">
            <button className="bg-primary text-primary-contrast px-4 py-2 rounded-[--radius-md] shadow-[--shadow-sm]">
              Tailwind Button
            </button>

            <Button variant="contained" color="primary">
              MUI Button
            </Button>
          </div>

          <Card className="mt-6">
            <CardContent className="space-y-3">
              <TextField label="Segment name" fullWidth />
              <Button variant="outlined">Save</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
