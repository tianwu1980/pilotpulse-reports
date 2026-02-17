"use client";

import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import type { ExcelRow } from "../types";

interface FileUploaderProps {
  onRowsParsed: (rows: ExcelRow[], fileNames: string[]) => void;
}

export default function FileUploader({ onRowsParsed }: FileUploaderProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFiles = useCallback(
    async (files: FileList) => {
      setParsing(true);
      setError(null);
      const allRows: ExcelRow[] = [];
      const names: string[] = [];

      try {
        for (const file of Array.from(files)) {
          names.push(file.name);
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: "array", cellDates: true });

          // Try 'Conversation Reports' sheet first, fall back to first sheet
          const sheetName =
            workbook.SheetNames.find((n) =>
              n.toLowerCase().includes("conversation")
            ) || workbook.SheetNames[0];

          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            defval: "",
            raw: false,
          });
          allRows.push(...rows);
        }

        setFileNames(names);
        onRowsParsed(allRows, names);
      } catch (err) {
        setError(
          `Failed to parse Excel file: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setParsing(false);
      }
    },
    [onRowsParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        parseFiles(e.dataTransfer.files);
      }
    },
    [parseFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        parseFiles(e.target.files);
      }
    },
    [parseFiles]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Excel Files
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${parsing ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-accent/5"}
        `}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx,.xls"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary">Parsing Excel files...</p>
          </div>
        ) : fileNames.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">
              {fileNames.length} file{fileNames.length > 1 ? "s" : ""} loaded
            </p>
            <p className="text-xs text-text-muted">
              {fileNames.join(", ")}
            </p>
            <p className="text-xs text-accent mt-1">Click or drop to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-border-light flex items-center justify-center">
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">
              Drop Excel files here or click to browse
            </p>
            <p className="text-xs text-text-muted">.xlsx or .xls files</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
