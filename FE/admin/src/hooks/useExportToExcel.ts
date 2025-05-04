import { useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ExportExcelProps<T> = {
  data: T[];
  fileName?: string;
  sheetName?: string;
};

function useExportToExcel<T>() {
  const exportToExcel = useCallback(({ data, fileName = "data", sheetName = "Sheet1" }: ExportExcelProps<T>) => {
    if (!data || data.length === 0) {
      console.warn("No data to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}.xlsx`);
  }, []);

  return exportToExcel;
}

export default useExportToExcel;
