import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Home } from "lucide-react";
import axios from "axios";
import api from "../api";
import toast from "react-hot-toast";

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

interface IssueForm {
  studentId: string;
  bookId: string;
  issuedate: string;
}

// yyyy-mm-dd, what <input type="date"> expects
const today = new Date().toISOString().slice(0, 10);

export default function IssueBook() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IssueForm>({
    defaultValues: { studentId: "", bookId: "", issuedate: today },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, studentsRes] = await Promise.all([
          api.get("/books/all"),
          api.get("/students/all"),
        ]);

        setBooks(booksRes.data.data);
        setStudents(studentsRes.data.data);
      } catch (err) {
        setApiError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? "Can't reach the server.")
            : "Couldn't load books and students.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSubmit = async (values: IssueForm) => {
    setApiError("");

    try {
      await api.post("/issues", {
        bookId: Number(values.bookId),
        studentId: Number(values.studentId),
        issuedate: values.issuedate,
      });
      toast.success("Book Issued");

      navigate("/issues");
    } catch (err) {
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      const message = data?.message ?? "Couldn't issue that book.";

      if (data?.errField === "bookId") {
        setError("bookId", { message }, { shouldFocus: true });
        return;
      }
      toast.error(message);
      setApiError(message);
    }
  };

  const fieldClass = (invalid: boolean) =>
    `w-full rounded border bg-slate-100/70 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-none ${
      invalid
        ? "border-red-300 focus:border-red-400"
        : "border-slate-200 focus:border-slate-300"
    }`;

  return (
    <div className="px-6 py-6">
      <div className="mb-5">
        <h5 className="mb-2 text-lg font-semibold text-slate-800">
          Issue Book
        </h5>
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/books" className="hover:text-slate-700">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/issues" className="hover:text-slate-700">
            Issue List
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">Issue Book</span>
        </nav>
      </div>

      <div className="rounded border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          {apiError && (
            <p
              role="alert"
              className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {apiError}
            </p>
          )}

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="studentId"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Student Name <span className="text-red-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <select
                    id="studentId"
                    className={fieldClass(!!errors.studentId)}
                    {...register("studentId", {
                      required: "Pick a student",
                    })}
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.rollno})
                      </option>
                    ))}
                  </select>
                  {errors.studentId && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.studentId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="bookId"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Book Name <span className="text-red-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <select
                    id="bookId"
                    className={fieldClass(!!errors.bookId)}
                    {...register("bookId", {
                      required: "Pick a book",
                    })}
                  >
                    <option value="">Select book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.bookname}
                      </option>
                    ))}
                  </select>
                  {errors.bookId && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.bookId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="issuedate"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Issue Date <span className="text-red-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="issuedate"
                    type="date"
                    min={today}
                    max={today}
                    className={fieldClass(!!errors.issuedate)}
                    {...register("issuedate", {
                      required: "Issue date is required",
                    })}
                  />
                  {errors.issuedate && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.issuedate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 flex justify-end gap-2 sm:col-span-9">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded bg-[#4099ff] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#2b8cff] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Issuing…" : "Issue Book"}
                  </button>
                  <Link
                    to="/issues"
                    className="rounded bg-[#ff5370] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#ff3a5c]"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
