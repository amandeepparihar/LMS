import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import axios from "axios";
import api from "../api";

interface Student {
  id: number;
  name: string;
  rollno: string;
  phoneno: string;
  email: string;
  address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  photo: string | null;
}

const UPLOADS_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace("/api", "/uploads");

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await api.get("/students");
        setStudents(res.data.data);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? "Can't reach the server.")
            : "Couldn't load the students.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`Delete "${student.name}"?`)) {
      return;
    }

    setError("");

    try {
      await api.delete(`/students/${student.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Couldn't delete that student.")
          : "Couldn't delete that student.",
      );
    }
  };

  const handleExport = async () => {
    setError("");
    setExporting(true);

    try {
      const res = await api.get("/students/export", { responseType: "blob" });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "students.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't export the students.");
    } finally {
      setExporting(false);
    }
  };

  const handlePhotoDownload = async (student: Student) => {
    setError("");

    try {
      const res = await api.get(`/students/${student.id}/photo`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${student.rollno}${student.photo?.slice(student.photo.lastIndexOf(".")) ?? ".jpg"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't download that photo.");
    }
  };

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "photo",
        header: "Photo",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) =>
          row.original.photo ? (
            <img
              src={`${UPLOADS_URL}/${row.original.photo}`}
              alt=""
              className="h-10 w-10 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
              {row.original.name.charAt(0).toUpperCase()}
            </div>
          ),
      },
      {
        accessorKey: "name",
        header: "Student Name",
        cell: (info) => (
          <span className="font-medium text-slate-800">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "rollno",
        header: "Roll No",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "phoneno",
        header: "Phone",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "city",
        header: "City",
        cell: (info) => info.getValue<string | null>() ?? "—",
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {row.original.photo && (
              <button
                type="button"
                onClick={() => handlePhotoDownload(row.original)}
                aria-label={`Download photo of ${row.original.name}`}
                className="cursor-pointer rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              aria-label={`Delete ${row.original.name}`}
              className="cursor-pointer rounded p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
          Students
        </h1>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll no or phone"
              className="w-full rounded border border-slate-200 bg-slate-100/70 py-2 pr-3 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex cursor-pointer items-center gap-2 rounded bg-[#f5b700] px-4 py-2 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {exporting ? "Exporting…" : "Export"}
            </button>
            <Link
              to="/students/add"
              className="flex items-center gap-2 rounded bg-[#f5b700] px-4 py-2 text-sm font-medium text-black transition"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-200 text-left text-slate-500"
                >
                  {headerGroup.headers.map((header) => {
                    const sortable = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();

                    return (
                      <th key={header.id} className="px-4 py-3 font-medium">
                        {sortable ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex cursor-pointer items-center gap-1.5 transition hover:text-slate-800"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#c8860d]" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="h-3.5 w-3.5 text-[#c8860d]" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    Loading students…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {students.length === 0 ? (
                      <>
                        No students yet.{" "}
                        <Link
                          to="/students/add"
                          className="font-medium text-[#4099ff] underline underline-offset-4"
                        >
                          Add the first one.
                        </Link>
                      </>
                    ) : (
                      `No student matches "${search}".`
                    )}
                  </td>
                </tr>
              )}

              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-600">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <p className="text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex cursor-pointer items-center gap-1 rounded border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex cursor-pointer items-center gap-1 rounded border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
