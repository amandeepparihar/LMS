import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  SearchIcon,
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
import { useForm } from "react-hook-form";

interface Report {
  id: number;
  bookname: string;
  no_of_times_i: string;
  no_of_times_r: string;
}

const today = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

interface IssueFormState {
  rangeOne: string;
  rangeTwo: string;
}

export default function ReportList() {
  const [books, setBooks] = useState<Report[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "issueCount", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openBookId, setOpenBookId] = useState<number | null>(null);
  // const [openFineBookId, setOpenFineBookId] = useState<number | null>(null);
  // const [students, setStudents] = useState<IssuedTo[]>([]);
  // const [finedStudents, setFinedStudents] = useState<IssuedTo[]>([]);
  // const [studentsLoading, setStudentsLoading] = useState(false);
  // const [fineStudentsLoading, setFineStudentsLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);

      try {
        const sort = sorting[0];

        console.log("dateOne -> ", today);
        console.log("dateTwo -> ", oneWeekAgo);

        const res = await api.get("/date/", {
          params: {
            dateOne: oneWeekAgo,
            dateTwo: today,
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            sortBy: sort ? sort.id : undefined,
            order: sort ? (sort.desc ? "desc" : "asc") : undefined,
          },
        });

        console.log("data -> ", res);

        setBooks(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setOpenBookId(null);
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
  }, [pagination, sorting]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormState>({
    defaultValues: {
      rangeOne: oneWeekAgo,
      rangeTwo: today,
    },
  });

  const onSubmit = async (values: IssueFormState) => {
    console.log("values ->", values);
    try {
      //api call
      const res = await api.get("/date/", {
        params: {
          dateOne: values.rangeOne,
          dateTwo: values.rangeTwo,
        },
      });
      console.log("res -> ", res);
      setBooks(res.data.data);
    } catch (error) {
      console.log("error -> ", error);
    }
  };

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        accessorKey: "bookId",
        header: "Book Id",
        cell: (info) => {
          return (
            <span className="font-medium text-slate-800">
              {info.getValue<string>()}
            </span>
          );
        },
      },
      {
        accessorKey: "bookname",
        header: "Book Name",
        cell: (info) => {
          const bookName = info.getValue<string>();
          return bookName.length > 25 ? (
            <span className="font-medium text-slate-800">
              {bookName.slice(0, 25)}...
            </span>
          ) : (
            <span className="font-medium text-slate-800">
              {info.getValue<string>()}
            </span>
          );
        },
      },
      {
        accessorKey: "no_of_times_i",
        header: "Total issue count",
        cell: ({ row }) => {
          return (
            <div className="font-medium text-slate-800">
              {row.original.no_of_times_i}
            </div>
          );
        },
      },
      {
        accessorKey: "no_of_times_r",
        header: "Total Return count",
        cell: ({ row }) => {
          return (
            <div className="font-medium text-slate-800">
              {row.original.no_of_times_r}
            </div>
          );
        },
      },
    ],
    [openBookId],
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
            Issue Reports
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative mb-4 max-w-sm flex gap-2"
      >
        <input
          type="date"
          id="rangeOne"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 pr-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#f5b700] focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
          {...register("rangeOne", {
            required: "Pick a date",
          })}
        />
        <input
          type="date"
          id="rangeTwo"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2.5 pr-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#f5b700] focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none"
          {...register("rangeTwo", {
            required: "Pick a date",
          })}
        />
        <button className="border-1 rounded-md border-slate-200 px-4 ">
          <SearchIcon />
        </button>
      </form>

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
                  No books have been issued yet
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
