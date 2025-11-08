import { useState } from "react";
import { Header } from "@/components/Header";
import { RecommendationCard } from "@/components/RecommendationCard";
import { TransactionList } from "@/components/TransactionList";
import { Coins, Coffee, ShoppingBag, Utensils } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
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

  const handleSave = (amount: string) => {
    toast.success(`Great! You saved ${amount}`);
  };

  const handleDismiss = () => {
    toast("Recommendation dismissed");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onSave={() => handleSave(rec.saveAmount)}
                  onDismiss={handleDismiss}
                />
              ))}
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
