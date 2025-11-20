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
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Goal, Transaction, Nudge } from "@/lib/supabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    vendor: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [goalsData, transactionsData, nudgesData] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('nudges').select('*').eq('user_id', user.id).eq('is_dismissed', false).order('created_at', { ascending: false })
      ]);

      if (goalsData.data) setGoals(goalsData.data);
      if (transactionsData.data) setTransactions(transactionsData.data);
      if (nudgesData.data) setNudges(nudgesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.vendor || !newTransaction.amount || !newTransaction.category || !user) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (isEditMode && editingTransactionId) {
        const { error } = await supabase.from('transactions').update({
          vendor: newTransaction.vendor,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          date: newTransaction.date,
        }).eq('id', editingTransactionId);

        if (error) throw error;

        toast.success(`Transaction updated`);
      } else {
        const { error } = await supabase.from('transactions').insert({
          user_id: user.id,
          vendor: newTransaction.vendor,
          amount: parseFloat(newTransaction.amount),
          category: newTransaction.category,
          date: newTransaction.date,
        });

        if (error) throw error;

        toast.success(`Transaction added: ${newTransaction.vendor} - $${newTransaction.amount}`);
      }

      setIsAddTransactionOpen(false);
      setIsEditMode(false);
      setEditingTransactionId(null);
      setNewTransaction({
        vendor: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save transaction");
    }
  };

  const handleEditTransaction = (transaction: any) => {
    const originalTransaction = transactions.find(t => t.id === transaction.id);
    if (originalTransaction) {
      setNewTransaction({
        vendor: originalTransaction.vendor,
        amount: originalTransaction.amount.toString(),
        category: originalTransaction.category,
        date: originalTransaction.date,
      });
      setEditingTransactionId(transaction.id);
      setIsEditMode(true);
      setIsAddTransactionOpen(true);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) throw error;

      toast.success("Transaction deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  const getIconForNudgeType = (type: string) => {
    switch (type) {
      case 'round_up':
        return Coins;
      case 'vendor_pattern':
        return Coffee;
      case 'category_pattern':
        return ShoppingBag;
      default:
        return Coins;
    }
  };

  const recommendations = nudges.map(nudge => ({
    id: nudge.id,
    icon: getIconForNudgeType(nudge.nudge_type),
    title: nudge.title,
    description: nudge.description,
    saveAmount: `$${nudge.save_amount.toFixed(2)}`,
  }));

  const handleSave = async (amount: string, goalId: string, nudgeId: string) => {
    if (!user) return;

    const goal = goals.find(g => g.id === goalId);
    const amountValue = parseFloat(amount.replace('$', ''));

    try {
      const { error: savingsError } = await supabase.from('savings_actions').insert({
        user_id: user.id,
        goal_id: goalId,
        amount: amountValue,
        type: 'manual',
        description: `Saved ${amount} to ${goal?.name}`,
      });

      if (savingsError) throw savingsError;

      const newAmount = (goal?.current_amount || 0) + amountValue;
      const { error: goalError } = await supabase.from('goals').update({
        current_amount: newAmount,
        updated_at: new Date().toISOString(),
      }).eq('id', goalId);

      if (goalError) throw goalError;

      const { error: dismissError } = await supabase
        .from('nudges')
        .update({ is_dismissed: true })
        .eq('id', nudgeId);

      if (dismissError) throw dismissError;

      toast.success(`Great! You saved ${amount} to ${goal?.name || "your goal"}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    }
  };

  const handleDismiss = async (nudgeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('nudges')
        .update({ is_dismissed: true })
        .eq('id', nudgeId);

      if (error) throw error;

      setNudges(nudges.filter(n => n.id !== nudgeId));
      toast("Recommendation dismissed");
    } catch (error: any) {
      toast.error(error.message || "Failed to dismiss");
    }
  };

  const mainGoal = goals[0] || null;

  const formattedTransactions = transactions.map(t => ({
    id: t.id,
    vendor: t.vendor,
    amount: `$${t.amount.toFixed(2)}`,
    category: t.category,
    timestamp: new Date(t.created_at).toLocaleDateString(),
  }));

  const goalsForCards = goals.map(g => ({
    id: g.id,
    name: g.name,
    current: g.current_amount,
    target: g.target_amount,
  }));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* User Welcome Section */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {profile?.name.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {profile?.name || "User"}!</h2>
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
              {mainGoal ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{mainGoal.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((mainGoal.current_amount / mainGoal.target_amount) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Progress value={(mainGoal.current_amount / mainGoal.target_amount) * 100} className="h-3" />
                        <p className="text-sm text-muted-foreground">
                          ${mainGoal.current_amount.toFixed(2)} / ${mainGoal.target_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>No goals yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* My Savings Nudges */}
            <section>
              <h2 className="text-2xl font-bold mb-4">My Savings Nudges</h2>
              <div className="space-y-4">
                {recommendations.length > 0 ? (
                  recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      icon={rec.icon}
                      title={rec.title}
                      description={rec.description}
                      saveAmount={rec.saveAmount}
                      goals={goalsForCards}
                      onSave={(goalId) => handleSave(rec.saveAmount, goalId, rec.id)}
                      onDismiss={() => handleDismiss(rec.id)}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      <p>No savings nudges at the moment. Add transactions to get personalized savings suggestions!</p>
                    </CardContent>
                  </Card>
                )}
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
                    <Button onClick={() => {
                      setIsEditMode(false);
                      setEditingTransactionId(null);
                      setNewTransaction({
                        vendor: "",
                        amount: "",
                        category: "",
                        date: new Date().toISOString().split('T')[0]
                      });
                    }}>+ Add Transaction</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isEditMode ? 'Edit Transaction' : 'Add a New Transaction'}</DialogTitle>
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
              <TransactionList
                transactions={formattedTransactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
