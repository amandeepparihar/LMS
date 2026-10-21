import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Home } from "lucide-react";
import axios from "axios";
import api from "../api";
import toast from "react-hot-toast";

interface BookForm {
  bookname: string;
  author: string;
  isbn: string;
  bookCover: FileList;
  quantity: string;
}

const MAX_COVER = 2 * 1024 * 1024;

export default function AddBook() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookForm>({
    // mode: "onTouched",
    defaultValues: { bookname: "", author: "", isbn: "", quantity: "" },
  });

  const onSubmit = async (values: BookForm) => {
    setApiError("");

    const form = new FormData();
    form.append("bookname", values.bookname.trim());
    form.append("author", values.author.trim());
    form.append("isbn", values.isbn.trim());
    form.append("quantity", values.quantity.trim());

    if (values.bookCover?.[0]) {
      form.append("bookCover", values.bookCover[0]);
    }

    try {
      await api.post("/books", form);
      toast.success("Book added");
      navigate("/books");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Can't reach the server.")
        : "Couldn't save that book.";

      // console.log("message -> ", err.response);
      if (message.toLowerCase().includes("isbn")) {
        setError("isbn", { message }, { shouldFocus: true });
        return;
      }
      toast.error(message);
      setApiError(message);
    }
  };

  const inputClass =
    "w-full rounded border bg-slate-100/70 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none";

  const fieldClass = (invalid: boolean) =>
    `${inputClass} ${
      invalid
        ? "border-red-300 focus:border-red-400"
        : "border-slate-200 focus:border-slate-300"
    }`;

  return (
    <div className="px-6 py-6">
      <div className="mb-5">
        <h5 className="mb-2 text-lg font-semibold text-slate-800">Add Book</h5>
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/books" className="hover:text-slate-700">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/books" className="hover:text-slate-700">
            Book List
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">Add Book</span>
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4 grid grid-cols-12 items-start gap-4">
              <label
                htmlFor="bookname"
                className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
              >
                Book Name <span className="text-rose-600">*</span>
              </label>
              <div className="col-span-12 sm:col-span-6">
                <input
                  id="bookname"
                  autoFocus
                  placeholder="Book Name"
                  className={fieldClass(!!errors.bookname)}
                  {...register("bookname", {
                    required: "Book name is required",
                    maxLength: {
                      value: 100,
                      message: "Keep it under 100 characters",
                    },
                  })}
                />
                {errors.bookname && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.bookname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 items-start gap-4">
              <label
                htmlFor="author"
                className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
              >
                Author Name <span className="text-rose-600">*</span>
              </label>
              <div className="col-span-12 sm:col-span-6">
                <input
                  id="author"
                  placeholder="Author Name"
                  className={fieldClass(!!errors.author)}
                  {...register("author", {
                    required: "Author name is required",
                  })}
                />
                {errors.author && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.author.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-12 items-start gap-4">
              <label
                htmlFor="isbn"
                className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
              >
                ISBN <span className="text-rose-600">*</span>
              </label>
              <div className="col-span-12 sm:col-span-6">
                <input
                  id="isbn"
                  placeholder="ISBN"
                  className={`${fieldClass(!!errors.isbn)} tabular-nums`}
                  {...register("isbn", {
                    required: "ISBN is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only number allowed",
                    },
                  })}
                />
                {errors.isbn && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.isbn.message}
                  </p>
                )}
              </div>
            </div>

            {/* for quantity */}
            <div className="mb-4 grid grid-cols-12 items-start gap-4">
              <label
                htmlFor="quantity"
                className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
              >
                Quantity <span className="text-rose-600">*</span>
              </label>
              <div className="col-span-12 sm:col-span-6">
                <input
                  id="quantity"
                  placeholder="quantity"
                  className={`${fieldClass(!!errors.quantity)} tabular-nums`}
                  {...register("quantity", {
                    required: "quantity is required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Only number allowed",
                    },
                  })}
                />
                {errors.quantity && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-12 items-start gap-4">
              <label
                htmlFor="cover"
                className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
              >
                Book Cover
              </label>
              <div className="col-span-12 sm:col-span-6">
                <input
                  id="cover"
                  type="file"
                  accept="image/jpeg,image/png"
                  className={`${fieldClass(
                    !!errors.bookCover,
                  )} cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-sm file:text-slate-700 hover:file:bg-slate-300`}
                  {...register("bookCover", {
                    validate: {
                      size: (files) =>
                        !files?.[0] ||
                        files[0].size <= MAX_COVER ||
                        "Image must be 2MB or smaller",
                      type: (files) =>
                        !files?.[0] ||
                        ["image/jpeg", "image/png"].includes(files[0].type) ||
                        "Only JPG or PNG images",
                    },
                  })}
                />
                {errors.bookCover ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.bookCover.message}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Optional. JPG or PNG, up to 2MB.
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
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
                <Link
                  to="/books"
                  className="rounded bg-[#ff5370] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#ff3a5c]"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
