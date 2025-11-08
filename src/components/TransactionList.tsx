import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  vendor: string;
  amount: string;
  category: string;
  timestamp: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{transaction.vendor}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category} • {transaction.timestamp}
              </p>
            </div>
            <p className="font-semibold text-sm">{transaction.amount}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
