import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  name: string;
  date: string;
}

const Reports = () => {
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
