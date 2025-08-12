import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type SupportedFileType = 'csv' | 'excel' | 'txt';

export function getFileType(fileName: string): SupportedFileType | null {
  const extension = fileName.toLowerCase().split('.').pop();
  if (extension === 'csv') {
    return 'csv';
  }
  if (['xlsx', 'xls'].includes(extension || '')) {
    return 'excel';
  }
  if (extension === 'txt') {
    return 'txt';
  }
  return null;
}

export async function parseFile(file: File): Promise<string[]> {
  const fileType = getFileType(file.name);
  if (!fileType) {
    throw new Error('Unsupported file type. Please upload a CSV, Excel, or TXT file.');
  }

  if (fileType === 'txt') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const queries = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          resolve(queries);
        } catch (error) {
          reject(new Error('Error parsing TXT file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file);
    });
  }

  if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error('Error parsing CSV file'));
            return;
          }
          // Flatten and filter the data
          const queries = results.data
            .flat()
            .filter((query): query is string => 
              typeof query === 'string' && query.trim().length > 0
            );
          resolve(queries);
        },
        error: (error) => {
          reject(new Error(`Error parsing CSV file: ${error.message}`));
        }
      });
    });
  }

  // Handle Excel files
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Flatten and filter the data
        const queries = jsonData
          .flat()
          .filter((query): query is string => 
            typeof query === 'string' && query.trim().length > 0
          );
        resolve(queries);
      } catch (error) {
        reject(new Error('Error parsing Excel file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsArrayBuffer(file);
  });
}
