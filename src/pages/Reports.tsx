import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  date: string;
}

const Reports = () => {
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "savings_summary_user123.json",
      date: "January 15, 2025",
    },
    {
      id: "2",
      name: "savings_summary_user123_dec.json",
      date: "December 31, 2024",
    },
  ]);

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: Date.now().toString(),
      name: `savings_summary_user123_${new Date().toISOString().split('T')[0]}.json`,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    };
    setReports([newReport, ...reports]);
    toast.success("New savings report generated!");
  };

  const handleAddTransaction = () => {
    if (!vendor || !amount || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success(`Transaction added: ${vendor} - $${amount}`);
    setVendor("");
    setAmount("");
    setCategory("");
    setIsDialogOpen(false);
  };

  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Savings Reports</h1>
          <p className="text-muted-foreground">
            Generate and download your savings summaries
          </p>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Add a New Transaction</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">+ Add Transaction</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="vendor">Vendor Name</Label>
                  <Input
                    id="vendor"
                    placeholder="e.g., Coffee Spot"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 4.20"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Food"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddTransaction} className="w-full">
                  Submit Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        <Button 
          onClick={handleGenerateReport} 
          className="w-full mb-8"
          size="lg"
        >
          Generate New Savings Report
        </Button>

        <div>
          <h2 className="text-xl font-semibold mb-4">My Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(report.name)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
