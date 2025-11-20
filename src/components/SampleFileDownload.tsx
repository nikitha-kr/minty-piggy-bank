import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export const SampleFileDownload = () => {
  const generateSampleCSV = () => {
    const sampleData = [
      { vendor: "Starbucks", amount: "5.25", category: "Food", date: "2024-01-15" },
      { vendor: "Target", amount: "42.99", category: "Shopping", date: "2024-01-16" },
      { vendor: "Shell Gas Station", amount: "35.00", category: "Transportation", date: "2024-01-17" },
      { vendor: "Amazon", amount: "23.45", category: "Shopping", date: "2024-01-18" },
    ];

    const csvContent = [
      "vendor,amount,category,date",
      ...sampleData.map(row => `${row.vendor},${row.amount},${row.category},${row.date}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateSampleExcel = () => {
    const sampleData = [
      { vendor: "Starbucks", amount: 5.25, category: "Food", date: "2024-01-15" },
      { vendor: "Target", amount: 42.99, category: "Shopping", date: "2024-01-16" },
      { vendor: "Shell Gas Station", amount: 35.00, category: "Transportation", date: "2024-01-17" },
      { vendor: "Amazon", amount: 23.45, category: "Shopping", date: "2024-01-18" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, 'sample_transactions.xlsx');
  };

  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button variant="outline" size="sm" onClick={generateSampleCSV}>
        <Download className="h-4 w-4 mr-2" />
        Sample CSV
      </Button>
      <Button variant="outline" size="sm" onClick={generateSampleExcel}>
        <Download className="h-4 w-4 mr-2" />
        Sample Excel
      </Button>
    </div>
  );
};
