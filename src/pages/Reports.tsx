import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [percentageSaved, setPercentageSaved] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState<any[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    if (!user || !profile) return;

    try {
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transError) throw transError;

      const { data: savingsActions, error: savingsError } = await supabase
        .from('savings_actions')
        .select('*')
        .eq('user_id', user.id);

      if (savingsError) throw savingsError;

      const totalExpense = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      setTotalExpenses(totalExpense);

      const totalSavings = savingsActions?.reduce((sum, s) => sum + s.amount, 0) || 0;
      const monthlyIncome = profile.monthly_income || 0;
      const percentage = monthlyIncome > 0 ? (totalSavings / monthlyIncome) * 100 : 0;
      setPercentageSaved(percentage);

      const savingsByMonth: { [key: string]: number } = {};
      savingsActions?.forEach(action => {
        const month = new Date(action.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        savingsByMonth[month] = (savingsByMonth[month] || 0) + action.amount;
      });

      const monthlySavingsData = Object.entries(savingsByMonth).map(([month, amount]) => ({
        month,
        amount,
      }));
      setMonthlySavings(monthlySavingsData.slice(-6));

      const categoryMap: { [key: string]: number } = {};
      transactions?.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));
      setExpensesByCategory(categoryData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Visualizing your financial health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">% of Income Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">
                {percentageSaved.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">
                ${totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Savings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySavings.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlySavings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Savings ($)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No savings data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
