import { useState } from "react";
import { Header } from "@/components/Header";
import { RecommendationCard } from "@/components/RecommendationCard";
import { GoalCard } from "@/components/GoalCard";
import { TransactionList } from "@/components/TransactionList";
import { Button } from "@/components/ui/button";
import { Coins, Coffee, ShoppingBag, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [goals] = useState([
    { id: "1", name: "Emergency Fund", current: 150, target: 500 },
    { id: "2", name: "Vacation", current: 75, target: 1000 },
  ]);

  const [recommendations] = useState([
    {
      id: "1",
      icon: Coins,
      title: "Round-Up & Save",
      description: "You spent $4.20 at Coffee Spot. Want to save the $0.80 round-up?",
      saveAmount: "$0.80",
    },
    {
      id: "2",
      icon: Coffee,
      title: "Coffee Savings",
      description: "You've bought coffee 3 times this week. Brewing at home could save you $15/week!",
      saveAmount: "$15",
    },
    {
      id: "3",
      icon: ShoppingBag,
      title: "Shopping Smart",
      description: "Your online shopping at Fashion Store had a $5.45 round-up opportunity.",
      saveAmount: "$5.45",
    },
  ]);

  const [transactions] = useState([
    {
      id: "1",
      vendor: "Coffee Spot",
      amount: "$4.20",
      category: "Food",
      timestamp: "Today, 2:30 PM",
    },
    {
      id: "2",
      vendor: "Fashion Store",
      amount: "$64.55",
      category: "Shopping",
      timestamp: "Today, 11:15 AM",
    },
    {
      id: "3",
      vendor: "Quick Mart",
      amount: "$12.89",
      category: "Groceries",
      timestamp: "Yesterday, 6:45 PM",
    },
    {
      id: "4",
      vendor: "Pizza Palace",
      amount: "$18.75",
      category: "Food",
      timestamp: "Yesterday, 7:30 PM",
    },
    {
      id: "5",
      vendor: "Gas Station",
      amount: "$45.00",
      category: "Transportation",
      timestamp: "2 days ago",
    },
  ]);

  const handleSave = (amount: string, goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    toast.success(`Great! You saved ${amount} to ${goal?.name || "your goal"}`);
  };

  const handleDismiss = () => {
    toast("Recommendation dismissed");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Savings Goals</h2>
                <Button onClick={() => navigate("/goals")} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Goal
                </Button>
              </div>
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

            <div>
              <h2 className="text-2xl font-bold mb-4">My Savings Nudges</h2>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    icon={rec.icon}
                    title={rec.title}
                    description={rec.description}
                    saveAmount={rec.saveAmount}
                    goals={goals}
                    onSave={(goalId) => handleSave(rec.saveAmount, goalId)}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
