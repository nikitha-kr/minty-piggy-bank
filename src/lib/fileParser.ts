import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedTransaction {
  vendor: string;
  amount: number;
  category: string;
  date: string;
}

export const parseExcelFile = async (file: File): Promise<ParsedTransaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const transactions = jsonData.map((row: any) => {
          const vendor = row.vendor || row.Vendor || row.VENDOR || row.description || row.Description || '';
          const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || row.total || row.Total || '0');
          const category = row.category || row.Category || row.CATEGORY || 'Uncategorized';
          const date = row.date || row.Date || row.DATE || new Date().toISOString().split('T')[0];

          return {
            vendor: String(vendor),
            amount: isNaN(amount) ? 0 : Math.abs(amount),
            category: String(category),
            date: formatDate(date),
          };
        }).filter(t => t.vendor && t.amount > 0);

        resolve(transactions);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it has columns: vendor, amount, category, date'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const parseCSVFile = async (file: File): Promise<ParsedTransaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions = results.data.map((row: any) => {
            const vendor = row.vendor || row.Vendor || row.VENDOR || row.description || row.Description || '';
            const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || row.total || row.Total || '0');
            const category = row.category || row.Category || row.CATEGORY || 'Uncategorized';
            const date = row.date || row.Date || row.DATE || new Date().toISOString().split('T')[0];

            return {
              vendor: String(vendor),
              amount: isNaN(amount) ? 0 : Math.abs(amount),
              category: String(category),
              date: formatDate(date),
            };
          }).filter(t => t.vendor && t.amount > 0);

          resolve(transactions);
        } catch (error) {
          reject(new Error('Failed to parse CSV file. Please ensure it has columns: vendor, amount, category, date'));
        }
      },
      error: (error) => reject(new Error(`CSV parsing error: ${error.message}`)),
    });
  });
};

export const parseImageFile = async (file: File): Promise<ParsedTransaction[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve([{
        vendor: 'Receipt from ' + file.name.split('.')[0],
        amount: 0,
        category: 'Receipt',
        date: new Date().toISOString().split('T')[0],
      }]);
    };

    reader.readAsDataURL(file);
  });
};

export const parsePDFFile = async (file: File): Promise<ParsedTransaction[]> => {
  return new Promise((resolve) => {
    resolve([{
      vendor: 'Statement from ' + file.name.split('.')[0],
      amount: 0,
      category: 'Statement',
      date: new Date().toISOString().split('T')[0],
    }]);
  });
};

const formatDate = (dateInput: any): string => {
  if (!dateInput) return new Date().toISOString().split('T')[0];

  if (typeof dateInput === 'number') {
    const date = XLSX.SSF.parse_date_code(dateInput);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

export const parseFile = async (file: File): Promise<ParsedTransaction[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'csv':
      return parseCSVFile(file);
    case 'pdf':
      return parsePDFFile(file);
    case 'jpg':
    case 'jpeg':
    case 'png':
      return parseImageFile(file);
    default:
      throw new Error('Unsupported file type. Please upload Excel, CSV, PDF, or image files.');
  }
};
