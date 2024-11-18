import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export async function exportToExcel(data: any[], filename: string, sheets: { name: string; columns: any[] }[]) {
  const workbook = new ExcelJS.Workbook();

  sheets.forEach(({ name, columns }) => {
    const worksheet = workbook.addWorksheet(name);
    worksheet.columns = columns;
    worksheet.addRows(data);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}