import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParsedTransaction {
  vendor: string;
  amount: number;
  category: string;
  date: string;
}

const extractField = (row: any, fieldNames: string[]): string => {
  console.log('Extracting field from row:', row, 'looking for:', fieldNames);

  for (const name of fieldNames) {
    const lowerName = name.toLowerCase();
    for (const key in row) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === lowerName || lowerKey.includes(lowerName) || lowerName.includes(lowerKey)) {
        const value = row[key];
        if (value !== null && value !== undefined && value !== '') {
          console.log(`Found field "${key}" for "${name}":`, value);
          return String(value);
        }
      }
    }
  }

  console.log('No field found for:', fieldNames);
  return '';
};

const parseAmount = (amountStr: string): number => {
  if (!amountStr) return 0;

  const cleaned = String(amountStr)
    .replace(/[$€£¥,\s]/g, '')
    .replace(/[()]/g, '-')
    .trim();

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount);
};

export const parseExcelFile = async (file: File): Promise<ParsedTransaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        console.log('Excel data parsed:', jsonData);
        console.log('Available columns:', jsonData.length > 0 ? Object.keys(jsonData[0]) : []);

        if (!jsonData || jsonData.length === 0) {
          reject(new Error('No data found in Excel file'));
          return;
        }

        const transactions = jsonData.map((row: any) => {
          const vendor = extractField(row, [
            'vendor', 'merchant', 'description', 'name', 'payee', 'store', 'shop'
          ]);

          const amountStr = extractField(row, [
            'amount', 'total', 'price', 'cost', 'value', 'sum', 'charge', 'payment'
          ]);

          const amount = parseAmount(amountStr);

          const category = extractField(row, [
            'category', 'type', 'class', 'group', 'tag'
          ]) || 'Uncategorized';

          const dateStr = extractField(row, [
            'date', 'transaction_date', 'purchase_date', 'posted_date', 'time', 'timestamp'
          ]);

          const date = formatDate(dateStr);

          return {
            vendor: String(vendor).trim(),
            amount: amount,
            category: String(category).trim(),
            date: date,
          };
        }).filter(t => t.vendor && t.vendor !== 'undefined' && t.amount > 0);

        console.log('Parsed transactions:', transactions);
        resolve(transactions);
      } catch (error: any) {
        console.error('Excel parsing error:', error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
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
      skipEmptyLines: true,
      complete: (results) => {
        try {
          console.log('CSV data parsed:', results.data);
          console.log('Available columns:', results.data.length > 0 ? Object.keys(results.data[0]) : []);

          if (!results.data || results.data.length === 0) {
            reject(new Error('No data found in CSV file'));
            return;
          }

          const transactions = results.data.map((row: any) => {
            const vendor = extractField(row, [
              'vendor', 'merchant', 'description', 'name', 'payee', 'store', 'shop'
            ]);

            const amountStr = extractField(row, [
              'amount', 'total', 'price', 'cost', 'value', 'sum', 'charge', 'payment'
            ]);

            const amount = parseAmount(amountStr);

            const category = extractField(row, [
              'category', 'type', 'class', 'group', 'tag'
            ]) || 'Uncategorized';

            const dateStr = extractField(row, [
              'date', 'transaction_date', 'purchase_date', 'posted_date', 'time', 'timestamp'
            ]);

            const date = formatDate(dateStr);

            return {
              vendor: String(vendor).trim(),
              amount: amount,
              category: String(category).trim(),
              date: date,
            };
          }).filter(t => t.vendor && t.vendor !== 'undefined' && t.amount > 0);

          console.log('Parsed transactions:', transactions);
          resolve(transactions);
        } catch (error: any) {
          console.error('CSV parsing error:', error);
          reject(new Error(`Failed to parse CSV file: ${error.message}`));
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
  if (!dateInput || dateInput === '') return new Date().toISOString().split('T')[0];

  if (typeof dateInput === 'number') {
    try {
      if (dateInput < 1 || dateInput > 2958465) {
        return new Date().toISOString().split('T')[0];
      }

      const date = XLSX.SSF.parse_date_code(dateInput);

      if (!date || !date.y || date.y < 1900 || date.y > 2100) {
        return new Date().toISOString().split('T')[0];
      }

      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  try {
    const dateStr = String(dateInput).trim();

    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return dateStr;
      }
    }

    if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [month, day, year] = dateStr.split('/').map(Number);
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
      const [month, day, year] = dateStr.split('-').map(Number);
      if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    const date = new Date(dateInput);
    const year = date.getFullYear();

    if (isNaN(date.getTime()) || year < 1900 || year > 2100) {
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
