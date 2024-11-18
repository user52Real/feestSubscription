"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Files } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/lib/export";

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: "guests" | "events" | "analytics";
}

export function ExportButton({ data, filename, type }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "excel" | "csv") => {
    setLoading(true);
    try {
      if (format === "excel") {
        const columns = getColumnsForType(type);
        await exportToExcel(data, filename, [{ name: "Data", columns }]);
      } else {
        exportToCSV(data, filename);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnsForType = (type: string) => {
    const columnMappings = {
      guests: [
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Status", key: "status", width: 15 },
        { header: "Role", key: "role", width: 15 },
        { header: "Invited At", key: "invitedAt", width: 20 },
        { header: "Checked In", key: "checkedIn", width: 15 },
      ],
      events: [
        { header: "Title", key: "title", width: 30 },
        { header: "Date", key: "startDate", width: 20 },
        { header: "Location", key: "location.venue", width: 25 },
        { header: "Status", key: "status", width: 15 },
        { header: "Capacity", key: "capacity", width: 15 },
      ],
      analytics: [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Value", key: "value", width: 20 },
        { header: "Date", key: "date", width: 20 },
      ],
    };

    return columnMappings[type as keyof typeof columnMappings] || [];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <Files className="mr-2 h-4 w-4" />
          Export to CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}