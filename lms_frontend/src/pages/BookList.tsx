import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Pencil,
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
import noBookCover from "../assets/nobookCover.png";

interface Book {
  id: number;
  bookname: string;
  author: string;
  isbn: string;
  bookCover: string | null;
}

const UPLOADS_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace("/api", "/uploads");

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await api.get("/books");
        setBooks(res.data.data);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? "Can't reach the server.")
            : "Couldn't load the books.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.bookname}"?`)) {
      return;
    }

    setError("");

    try {
      await api.delete(`/books/${book.id}`);
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Couldn't delete that book.")
          : "Couldn't delete that book.",
      );
    }
  };

  const columns = useMemo<ColumnDef<Book>[]>(
    () => [
      {
        id: "cover",
        header: "Cover",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) =>
          row.original.bookCover ? (
            <img
              src={`${UPLOADS_URL}/${row.original.bookCover}`}
              alt=""
              className="h-16 w-14 rounded border border-slate-200 object-cover"
            />
          ) : (
            <img
              src={noBookCover}
              alt=""
              className="h-16 w-14 rounded border border-slate-200 object-cover"
            />
          ),
      },
      {
        accessorKey: "bookname",
        header: "Book name",
        cell: (info) => (
          <span className="font-medium text-slate-800">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "author",
        header: "Author",
      },
      {
        accessorKey: "isbn",
        header: "ISBN",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<string>()}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              to={`/books/${row.original.id}/edit`}
              aria-label={`Edit ${row.original.bookname}`}
              className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(row.original)}
              aria-label={`Delete ${row.original.bookname}`}
              className="cursor-pointer rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
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
    data: books,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Books
          </h1>
        </div>

        <Link
          to="/books/add"
          className="inline-flex items-center gap-2 rounded-lg bg-[#f5b700] px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add book
        </Link>
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, author or ISBN"
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
                  Loading books…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {books.length === 0 ? (
                    <>
                      No books yet.{" "}
                      <Link
                        to="/books/add"
                        className="font-medium text-[#c8860d] underline underline-offset-4"
                      >
                        Add the first one.
                      </Link>
                    </>
                  ) : (
                    `No book matches "${search}".`
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

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
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
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
