import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CustomRule {
  id: string;
  vendor: string;
  amount: string;
}

const Rules = () => {
  const [autoRoundup, setAutoRoundup] = useState(true);
  const [dailySave, setDailySave] = useState(false);
  const [customRules, setCustomRules] = useState<CustomRule[]>([
    { id: "1", vendor: "Starbucks", amount: "2.00" },
  ]);

  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateRule = () => {
    if (!vendor || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    const newRule: CustomRule = {
      id: Date.now().toString(),
      vendor,
      amount,
    };

    setCustomRules([...customRules, newRule]);
    setVendor("");
    setAmount("");
    setIsDialogOpen(false);
    toast.success("Rule created!");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Automated Rules</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-roundup" className="text-base">
                  Automatically round-up ALL transactions
                </Label>
                <Switch
                  id="auto-roundup"
                  checked={autoRoundup}
                  onCheckedChange={setAutoRoundup}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-save" className="text-base">
                  Automatically save $1 every day
                </Label>
                <Switch
                  id="daily-save"
                  checked={dailySave}
                  onCheckedChange={setDailySave}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Custom Rules</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>+ Create New Rule</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a Custom Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="vendor">If my transaction vendor is...</Label>
                      <Input
                        id="vendor"
                        placeholder="e.g., Starbucks"
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="save-amount">Then save...</Label>
                      <Input
                        id="save-amount"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateRule} className="w-full">
                      Save Rule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-3">
              {customRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <p className="text-sm">
                    If vendor is <span className="font-semibold">{rule.vendor}</span>, save{" "}
                    <span className="font-semibold">${rule.amount}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Rules;
