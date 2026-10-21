import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import api from "../api";
import toast from "react-hot-toast";
import axios from "axios";

interface Book {
  id: number;
  bookname: string;
  isbn: string;
}

interface Student {
  id: number;
  name: string;
  rollno: string;
}

interface Issue {
  id: number;
  bookId: number;
  studentId: number;
  issuedate: string;
  returndate: string | null;
  status: "issued" | "returned";
  Book?: Book;
  Student?: Student;
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

export default function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // the two dropdowns above the grid
  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  // what was actually submitted with the Search button
  const [filters, setFilters] = useState({ studentId: "", bookId: "" });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [apiError, setApiError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [booksRes, studentsRes] = await Promise.all([
          api.get("/books", { params: { limit: 100 } }),
          api.get("/students", { params: { limit: 100 } }),
        ]);

        setBooks(booksRes.data.data);
        setStudents(studentsRes.data.data);
      } catch {
        setApiError("Couldn't load the filters.");
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const loadIssues = async () => {
      setLoading(true);

      try {
        const sort = sorting[0];

        const res = await api.get("/issues", {
          params: {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            studentId: filters.studentId || undefined,
            bookId: filters.bookId || undefined,
            sortBy: sort ? sort.id : undefined,
            order: sort ? (sort.desc ? "desc" : "asc") : undefined,
          },
        });

        setIssues(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      } catch {
        setApiError("Couldn't load the issue list.");
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [pagination, sorting, filters, reload]);

  const handleSearch = () => {
    setApiError("");
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
    );
    setFilters({ studentId: studentId, bookId: bookId });
  };

  const handleReturn = (issue: Issue) => {
    toast(
      (t) => (
        <div className="text-sm">
          <p className="mb-2 text-slate-800">
            Mark "{issue.Book?.bookname ?? "this book"}" as returned?
          </p>

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
                returnIssue(issue);
              }}
              className="cursor-pointer rounded-lg bg-[#4099ff] px-3 py-1 font-medium text-white hover:bg-[#2b8cff]"
            >
              Return
            </button>
          </div>
        </div>
      ),
      // stays open until a button is clicked
      { duration: Infinity },
    );
  };

  const returnIssue = async (issue: Issue) => {
    setReturningId(issue.id);

    try {
      await api.put(`/issues/${issue.id}/return`);
      toast.success("Book returned");
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? (err.response?.data?.message ?? "Couldn't mark that book returned.")
          : "Couldn't mark that book returned.",
      );
    } finally {
      setReturningId(null);
    }
  };

  const columns = useMemo<ColumnDef<Issue>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        cell: (info) => (
          <span className="tabular-nums">{info.getValue<number>()}</span>
        ),
      },
      {
        id: "book",
        header: "Book Name",
        accessorFn: (row) => row.Book?.bookname ?? "—",
        cell: (info) => {
          const bookName = info.getValue<string>();
          return bookName.length > 25 ? (
            <span className="font-medium text-slate-800">
              {bookName.slice(0, 25)}...{" "}
            </span>
          ) : (
            <span className="font-medium text-slate-800"> {bookName} </span>
          );
        },
      },
      {
        id: "student",
        header: "Student Name",
        accessorFn: (row) => row.Student?.name ?? "—",
        cell: ({ row }) => (
          <span>
            {row.original.Student?.name ?? "—"}
            {row.original.Student?.rollno && (
              <span className="ml-1.5 text-xs text-slate-400 tabular-nums">
                {row.original.Student.rollno}
              </span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "issuedate",
        header: "Issue Date",
        cell: (info) => (
          <span className="tabular-nums">
            {formatDate(info.getValue<string>())}
          </span>
        ),
      },
      {
        accessorKey: "returndate",
        header: "Return Date",
        cell: (info) => (
          <span className="tabular-nums">
            {formatDate(info.getValue<string | null>())}
          </span>
        ),
      },
      {
        id: "action",
        header: () => <span className="block text-right">Return Option</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            {row.original.status === "issued" ? (
              <button
                type="button"
                onClick={() => handleReturn(row.original)}
                disabled={returningId === row.original.id}
                className="cursor-pointer rounded bg-[#f5b700] px-3 py-1.5 text-xs font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {returningId === row.original.id ? "Returning…" : "Return"}
              </button>
            ) : (
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                Returned
              </span>
            )}
          </div>
        ),
      },
    ],
    [returningId],
  );

  const table = useReactTable({
    data: issues,
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

  const selectClass =
    "w-full rounded border border-slate-200 bg-slate-100/70 px-3 py-2 text-sm text-slate-700 focus:border-slate-300 focus:bg-white focus:outline-none";

  return (
    <div className="px-6">
      <div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">
          Issues
        </h1>
      </div>

      {apiError && (
        <p
          role="alert"
          className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {apiError}
        </p>
      )}

      <div className="mb-5 rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-12 items-end gap-4">
          <div className="col-span-12 sm:col-span-4">
            <label
              htmlFor="filter-student"
              className="mb-1.5 block text-sm text-slate-600"
            >
              Student Name
            </label>
            <select
              id="filter-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={selectClass}
            >
              <option value="">All students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollno})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label
              htmlFor="filter-book"
              className="mb-1.5 block text-sm text-slate-600"
            >
              Book Name
            </label>
            <select
              id="filter-book"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className={selectClass}
            >
              <option value="">All books</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.bookname}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 sm:col-span-4">
            <button
              type="button"
              onClick={handleSearch}
              className="flex cursor-pointer items-center gap-2 rounded bg-[#f5b700] px-5 py-2 text-sm font-medium text-slate-900 transition"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="rounded border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h5 className="text-base font-semibold text-slate-800">Issue List</h5>
          <Link
            to="/issues/add"
            className="rounded bg-[#f5b700] px-4 py-2 text-sm font-medium text-black transition"
          >
            Issue Book
          </Link>
        </div>

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
                  Loading issues…
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  {filters.studentId || filters.bookId ? (
                    "No issue matches that filter."
                  ) : (
                    <>
                      Nothing issued yet.{" "}
                      <Link
                        to="/issues/add"
                        className="font-medium text-[#4099ff] underline underline-offset-4"
                      >
                        Issue a book.
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
                className="flex cursor-pointer items-center gap-1 rounded border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
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
