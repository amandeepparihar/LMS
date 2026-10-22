import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import axios from "axios";
import api from "../api";

interface Report {
  id: number;
  bookname: string;
  quantity: string;
  issueCount: string;
  total_students: string;
}

interface IssuedTo {
  id: number;
  issuedate: string;
  studentId: number;
  name: string;
  rollno: string;
}

interface OpenPanel {
  bookId: number;
  kind: "issued" | "fine";
}

const formatDate = (value: string) => new Date(value).toLocaleDateString();

export default function BookReportList() {
  const [books, setBooks] = useState<Report[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueCount", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [panel, setPanel] = useState<OpenPanel | null>(null);
  const [panelRows, setPanelRows] = useState<IssuedTo[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const openPanel = async (bookId: number, kind: "issued" | "fine") => {
    if (panel && panel.bookId === bookId && panel.kind === kind) {
      setPanel(null);
      return;
    }

    setError("");
    setPanel({ bookId: bookId, kind: kind });
    setPanelRows([]);
    setPanelLoading(true);

    try {
      const url = kind === "issued" ? `/issued/${bookId}` : `/fine/${bookId}`;
      const res = await api.get(url);
      console.log("data => ",res.data.data);
      setPanelRows(res.data.data);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Couldn't load the students.")
          : "Couldn't load the students.",
      );
      setPanel(null);
    } finally {
      setPanelLoading(false);
    }
  };

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);

      try {
        const sort = sorting[0];

        const res = await api.get("/issued", {
          params: {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: search || undefined,
            sortBy: sort ? sort.id : undefined,
            order: sort ? (sort.desc ? "desc" : "asc") : undefined,
          },
        });

        setBooks(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setPanel(null);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? "Can't reach the server.")
            : "Couldn't load the report.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [pagination, sorting, search]);

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        accessorKey: "bookname",
        header: "Book name",
        cell: (info) => {
          const bookName = info.getValue<string>();
          return bookName.length > 25 ? (
            <span className="font-medium text-slate-800">
              {bookName.slice(0, 25)}...
            </span>
          ) : (
            <span className="font-medium text-slate-800">{bookName}</span>
          );
        },
      },
      {
        accessorKey: "issueCount",
        header: "Total issue count",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openPanel(row.original.id, "issued")}
            className="cursor-pointer rounded-lg bg-[#4099ff] px-3 py-1 text-xs font-medium text-white tabular-nums hover:bg-[#2b8cff]"
          >
            {row.original.issueCount}
          </button>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Available quantity",
        cell: (info) => {
          const left = info.getValue<number>();

          return (
            <span className="rounded-lg px-2 py-0.5 text-xs font-medium">
              {left}
            </span>
          );
        },
      },
      {
        accessorKey: "total_students",
        header: "Late Students",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openPanel(row.original.id, "fine")}
            className="cursor-pointer rounded-lg bg-[#4099ff] px-3 py-1 text-xs font-medium text-white tabular-nums hover:bg-[#2b8cff]"
          >
            {row.original.total_students}
          </button>
        ),
      },
    ],
    [panel],
  );

  const table = useReactTable({
    data: books,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Book Reports
          </h1>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search book name"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 pr-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#f5b700] focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
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
                          className="flex cursor-pointer items-center gap-1.5 hover:text-slate-800"
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
                  Loading report…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {search
                    ? `No book matches "${search}".`
                    : "No books have been issued yet."}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-600">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>

                  {panel && panel.bookId === row.original.id && (
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <td colSpan={columns.length} className="px-4 py-3">
                        {panelLoading ? (
                          <p className="text-sm text-slate-400">
                            Loading students…
                          </p>
                        ) : panelRows.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            {panel.kind === "issued"
                              ? "Nobody has this book right now."
                              : "No late students for this book."}
                          </p>
                        ) : (
                          <ul className="space-y-1">
                            {panelRows.map((student) => (
                              <li
                                key={student.id}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <span className="font-medium">
                                  {student.name}
                                </span>
                                <span className="text-xs text-slate-400 tabular-nums">
                                  {student.rollno}
                                </span>
                                {student.issuedate && (
                                  <span className="text-xs text-slate-400">
                                    issued {formatDate(student.issuedate)}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <p className="text-slate-500">
              Page {pagination.pageIndex + 1} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
