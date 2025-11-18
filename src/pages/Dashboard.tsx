import { Header } from "@/components/Header";
import { RecommendationCard } from "@/components/RecommendationCard";
import { TransactionList } from "@/components/TransactionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Coins, Coffee, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName] = useState("John Doe");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    vendor: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  });

  const mainGoal = {
    title: "Emergency Fund",
    current: 150,
    target: 500
  };

  const handleAddTransaction = () => {
    if (!newTransaction.vendor || !newTransaction.amount || !newTransaction.category) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Transaction added: ${newTransaction.vendor} - $${newTransaction.amount}`);
    setIsAddTransactionOpen(false);
    setNewTransaction({
      vendor: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0]
    });
  };
  
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* User Welcome Section */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {userName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {userName}!</h2>
            <p className="text-muted-foreground">Here's your savings overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* My Savings Goals */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Savings Goals</h2>
                <Button onClick={() => navigate("/goals")}>View All Goals</Button>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{mainGoal.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((mainGoal.current / mainGoal.target) * 100)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={(mainGoal.current / mainGoal.target) * 100} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        ${mainGoal.current} / ${mainGoal.target}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* My Savings Nudges */}
            <section>
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
            </section>
          </div>

          <div className="space-y-6">
            {/* Transactions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recent Transactions</h2>
                <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button>+ Add Transaction</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendor">Vendor Name</Label>
                        <Input
                          id="vendor"
                          placeholder="Coffee Spot"
                          value={newTransaction.vendor}
                          onChange={(e) => setNewTransaction({...newTransaction, vendor: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="4.20"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="Food"
                          value={newTransaction.category}
                          onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newTransaction.date}
                          onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleAddTransaction} className="w-full">
                        Save Transaction
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <TransactionList transactions={transactions} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
