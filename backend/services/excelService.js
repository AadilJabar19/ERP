const XLSX = require('xlsx');

class ExcelService {
  exportToExcel(data, filename = 'export.xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  exportMultipleSheets(sheets, filename = 'export.xlsx') {
    const workbook = XLSX.utils.book_new();
    
    Object.entries(sheets).forEach(([sheetName, data]) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = new ExcelService();