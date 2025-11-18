import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { GoalCard } from "@/components/GoalCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Goal as DbGoal } from "@/lib/supabase";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
}

const Goals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalName, setGoalName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchGoals();
  }, [user, navigate]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setGoals(data.map(g => ({
          id: g.id,
          name: g.name,
          current: g.current_amount,
          target: g.target_amount,
        })));
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName || !totalAmount || !user) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        name: goalName,
        target_amount: parseFloat(totalAmount),
        current_amount: 0,
      });

      if (error) throw error;

      setGoalName("");
      setTotalAmount("");
      toast.success(`Goal "${goalName}" created!`);
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || "Failed to create goal");
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
            <h2 className="text-2xl font-bold mb-4">Create a New Goal</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Vacation"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="e.g., 1000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">My Active Goals</h2>
            <div className="space-y-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  title={goal.name}
                  current={goal.current}
                  target={goal.target}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
