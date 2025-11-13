import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";

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
            <div className="flex items-center gap-3">
              <p className="font-semibold text-sm">{transaction.amount}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
