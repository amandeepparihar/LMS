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
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import axios from "axios";
import api from "../api";
import noBookCover from "../assets/nobookCover.png";
import toast from "react-hot-toast";

interface Book {
  id: number;
  bookname: string;
  author: string;
  isbn: string;
  quantity: string;
  bookCover: string | null;
}

const UPLOADS_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace("/api", "/uploads");

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);

      try {
        const sort = sorting[0];

        const res = await api.get("/books", {
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
      } catch (err) {
        // console.log("message ->", err.response?.data);
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
  }, [pagination, sorting, search, reload]);

  const handleDelete = (book: Book) => {
    toast(
      (t) => (
        <div className="text-sm">
          <p className="mb-2 text-slate-800">Delete "{book.bookname}"?</p>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                removeBook(book);
              }}
              className="cursor-pointer rounded-lg bg-red-600 px-3 py-1 font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const removeBook = async (book: Book) => {
    try {
      await api.delete(`/books/${book.id}`);
      toast.success("Book deleted");
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(
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
        accessorKey: "author",
        header: "Author",
        cell: (info) => {
          const authorName = info.getValue<string>();
          return authorName.length > 25
            ? `${authorName.slice(0, 25)}...`
            : authorName;
        },
      },
      {
        accessorKey: "isbn",
        header: "ISBN",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<string>()}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="block text-right">Action</span>,
        enableSorting: false,
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
                  {search ? (
                    `No book matches "${search}".`
                  ) : (
                    <>
                      No books yet.{" "}
                      <Link
                        to="/books/add"
                        className="font-medium text-[#c8860d] underline underline-offset-4"
                      >
                        Add the first one.
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
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
