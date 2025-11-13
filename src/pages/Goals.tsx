import { useState } from "react";
import { Header } from "@/components/Header";
import { GoalCard } from "@/components/GoalCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", name: "Emergency Fund", current: 150, target: 500 },
    { id: "2", name: "Vacation", current: 75, target: 1000 },
  ]);

  const [goalName, setGoalName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const handleCreateGoal = () => {
    if (!goalName || !totalAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalName,
      current: 0,
      target: parseFloat(totalAmount),
    };

    setGoals([...goals, newGoal]);
    setGoalName("");
    setTotalAmount("");
    toast.success(`Goal "${goalName}" created!`);
  };

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
