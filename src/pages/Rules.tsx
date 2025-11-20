import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Rule as DbRule } from "@/lib/supabase";

interface CustomRule {
  id: string;
  vendor: string;
  amount: string;
}

const Rules = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [autoRoundup, setAutoRoundup] = useState(false);
  const [autoRoundupRuleId, setAutoRoundupRuleId] = useState<string | null>(null);
  const [dailySave, setDailySave] = useState(false);
  const [dailySaveRuleId, setDailySaveRuleId] = useState<string | null>(null);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchRules();
  }, [user, navigate]);

  const fetchRules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rules')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const roundupRule = data.find(r => r.type === 'automated' && r.name === 'Auto Round-Up');
        const dailyRule = data.find(r => r.type === 'automated' && r.name === 'Daily Save $1');

        if (roundupRule) {
          setAutoRoundup(roundupRule.enabled);
          setAutoRoundupRuleId(roundupRule.id);
        }

        if (dailyRule) {
          setDailySave(dailyRule.enabled);
          setDailySaveRuleId(dailyRule.id);
        }

        const custom = data.filter(r => r.type === 'custom').map(r => ({
          id: r.id,
          vendor: r.condition_value || '',
          amount: r.action_amount?.toString() || '0',
        }));

        setCustomRules(custom);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomatedRule = async (ruleType: 'roundup' | 'daily', enabled: boolean) => {
    if (!user) return;

    try {
      const ruleName = ruleType === 'roundup' ? 'Auto Round-Up' : 'Daily Save $1';
      const ruleId = ruleType === 'roundup' ? autoRoundupRuleId : dailySaveRuleId;

      if (ruleId) {
        const { error } = await supabase
          .from('rules')
          .update({ enabled })
          .eq('id', ruleId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('rules')
          .insert({
            user_id: user.id,
            name: ruleName,
            type: 'automated',
            enabled,
            condition_type: null,
            condition_value: null,
            action_amount: ruleType === 'daily' ? 1 : null,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          if (ruleType === 'roundup') {
            setAutoRoundupRuleId(data.id);
          } else {
            setDailySaveRuleId(data.id);
          }
        }
      }

      if (ruleType === 'roundup') {
        setAutoRoundup(enabled);
      } else {
        setDailySave(enabled);
      }

      toast.success(`Rule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update rule");
    }
  };

  const handleCreateRule = async () => {
    if (!vendor || !amount || !user) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase.from('rules').insert({
        user_id: user.id,
        name: `Save $${amount} for ${vendor}`,
        type: 'custom',
        enabled: true,
        condition_type: 'vendor',
        condition_value: vendor,
        action_amount: parseFloat(amount),
      });

      if (error) throw error;

      setVendor("");
      setAmount("");
      setIsDialogOpen(false);
      toast.success("Rule created!");
      fetchRules();
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
                  onCheckedChange={(checked) => handleToggleAutomatedRule('roundup', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-save" className="text-base">
                  Automatically save $1 every day
                </Label>
                <Switch
                  id="daily-save"
                  checked={dailySave}
                  onCheckedChange={(checked) => handleToggleAutomatedRule('daily', checked)}
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
