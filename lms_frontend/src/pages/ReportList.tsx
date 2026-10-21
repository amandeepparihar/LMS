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
  createColumnHelper,
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
// import noBookCover from "../assets/nobookCover.png";
// import toast from "react-hot-toast";

interface Data {
  IssueCount: string;
  Book: {
    id: string;
    bookname: string;
    quantity: string;
    IssueCount: string;
  };
}

// const UPLOADS_URL = (
//   import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
// ).replace("/api", "/uploads");

export default function ReportList() {
  const [books, setBooks] = useState<Data[]>([]);
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
        // const sort = sorting[0];

        const res = await api.get("/issued");

        // console.log("res ->", res.data.data);

        setBooks(res.data.data);
        setTotalPages(res.data.meta.totalPages);
      } catch (err) {
        // console.log("message ->", err.response?.data);
        // setError(
        //   axios.isAxiosError(err)
        //     ? (err.response?.data?.message ?? "Can't reach the server.")
        //     : "Couldn't load the books.",
        // );
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [pagination, sorting, search, reload]);

  const columnHelper = createColumnHelper<Data[]>();

  const columns: ColumnDef<Data[]> = [
    columnHelper.accessor("Book.bookname", {
      header: "Book Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("IssueCount", {
      header: "Total Issue Count",
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor("IssueCount", {
    //   header: "Total Issue Count",
    //   cell: (info) => info.getValue(),
    // }),
    columnHelper.accessor("Book.quantity", {
      header: "Available Quantity",
      cell: (info) => {
        const name = info.getValue() as string;
        console.log("name -> ", info)
        async function stuHandle(id: string) {
          const res = await api.get(`/issued/${id}`);
          console.log("res -> ", res);
        }

        return (
          <button
            onClick={() => stuHandle(info.cell.id)}
            className="bg-blue-600 px-4 text-white cursor-pointer"
          >
            {name}
            {/* show Students */}
          </button>
        );
      },
    }),
    // columnHelper.display("Book quantity",{
    //   id: "actions",
    //   header: "Actions",
    //   cell: (info) => {
    //     const rowData = info.row;
    //     console.log("row -> ", rowData)
    //     return (
    //       <button
    //         onClick={() => showStudents(rowData.id)}
    //         className="bg-blue-600 text-white cursor-pointer"
    //       >
    //         show Students
    //       </button>
    //     );
    //   },
    // }),
  ];

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
