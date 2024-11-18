"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Filter, SortAsc, SortDesc } from "lucide-react";

interface FilterConfig {
  field: string;
  operator: string;
  value: any;
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterConfig[]) => void;
  onSortChange: (sort: SortConfig[]) => void;
  fields: {
    name: string;
    type: "text" | "number" | "date" | "boolean" | "select";
    options?: string[];
  }[];
}

export function AdvancedFilter({
  onFilterChange,
  onSortChange,
  fields,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sorts, setSorts] = useState<SortConfig[]>([]);

  const addFilter = () => {
    const newFilter = {
      field: fields[0].name,
      operator: "equals",
      value: "",
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<FilterConfig>) => {
    const newFilters = filters.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter
    );
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const addSort = () => {
    const newSort = {
      field: fields[0].name,
      direction: "asc" as const,
    };
    setSorts([...sorts, newSort]);
  };

  const updateSort = (index: number, updates: Partial<SortConfig>) => {
    const newSorts = sorts.map((sort, i) =>
      i === index ? { ...sort, ...updates } : sort
    );
    setSorts(newSorts);
    onSortChange(newSorts);
  };

  const removeSort = (index: number) => {
    const newSorts = sorts.filter((_, i) => i !== index);
    setSorts(newSorts);
    onSortChange(newSorts);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Configure filters and sorting options
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              <Button onClick={addFilter} variant="outline" size="sm">
                Add Filter
              </Button>
            </div>
            {filters.map((filter, index) => (
              <div key={index} className="space-y-2 p-2 border rounded-md">
                <Select
                  value={filter.field}
                  onValueChange={(value) =>
                    updateFilter(index, { field: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(value) =>
                    updateFilter(index, { operator: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Value"
                  value={filter.value}
                  onChange={(e) =>
                    updateFilter(index, { value: e.target.value })
                  }
                />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFilter(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Sorting</h3>
              <Button onClick={addSort} variant="outline" size="sm">
                Add Sort
              </Button>
            </div>
            {sorts.map((sort, index) => (
              <div key={index} className="space-y-2 p-2 border rounded-md">
                <Select
                  value={sort.field}
                  onValueChange={(value) =>
                    updateSort(index, { field: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSort(index, {
                        direction: sort.direction === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    {sort.direction === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSort(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full"
            onClick={() => {
              onFilterChange(filters);
              onSortChange(sorts);
            }}
          >
            Apply Filters & Sorting
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}