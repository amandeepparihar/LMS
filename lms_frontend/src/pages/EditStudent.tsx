import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Home } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../api";

interface StudentForm {
  name: string;
  rollno: string;
  phoneno: string;
  country: string;
  state: string;
  city: string;
  photo: FileList;
}

const MAX_PHOTO = 2 * 1024 * 1024;

const UPLOADS_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
).replace("/api", "/uploads");

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentForm>({
    defaultValues: {
      name: "",
      rollno: "",
      phoneno: "",
      country: "",
      state: "",
      city: "",
    },
  });

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        const student = res.data.data;

        if (student) {
          // reset() fills the form after the data arrives, which
          // defaultValues can't do because they're read once on mount
          reset({
            name: student.name,
            rollno: student.rollno,
            phoneno: student.phoneno,
            country: student.country ?? "",
            state: student.state ?? "",
            city: student.city ?? "",
          });
          setCurrentPhoto(student.photo);
        }
      } catch {
        setApiError("Couldn't load that student.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id, reset]);

  const onSubmit = async (values: StudentForm) => {
    setApiError("");

    const form = new FormData();
    form.append("name", values.name.trim());
    form.append("rollno", values.rollno.trim());
    form.append("phoneno", values.phoneno.trim());
    form.append("country", values.country.trim());
    form.append("state", values.state.trim());
    form.append("city", values.city.trim());

    if (values.photo?.[0]) {
      form.append("photo", values.photo[0]);
    }

    try {
      await api.put(`/students/${id}`, form);
      toast.success("Student updated");
      navigate("/students");
    } catch (err) {
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      const message = data?.message ?? "Couldn't save those changes.";

      if (data?.errField === "rollno" || data?.errField === "phoneno") {
        setError(data.errField, { message }, { shouldFocus: true });
        return;
      }

      toast.error(message);
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
        <h5 className="mb-2 text-lg font-semibold text-slate-800">
          Edit Student
        </h5>
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/books" className="hover:text-slate-700">
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-slate-300">/</span>
          <Link to="/students" className="hover:text-slate-700">
            Student List
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">Edit Student</span>
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
            <p className="py-8 text-center text-sm text-slate-400">
              Loading student…
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="name"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Student Name <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="name"
                    autoFocus
                    placeholder="Student Name"
                    className={fieldClass(!!errors.name)}
                    {...register("name", {
                      required: "Student name is required",
                      maxLength: {
                        value: 100,
                        message: "Keep it under 100 characters",
                      },
                      pattern: {
                        value: /^[A-Za-z][A-Za-z\s'.-]*$/,
                        message: "Letters only",
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="rollno"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Roll No <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="rollno"
                    placeholder="Roll No"
                    className={`${fieldClass(!!errors.rollno)} tabular-nums`}
                    {...register("rollno", {
                      required: "Roll no is required",
                      pattern: {
                        value: /^[0-9]{1,20}$/,
                        message: "Digits only",
                      },
                    })}
                  />
                  {errors.rollno && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.rollno.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="phoneno"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Phone No <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="phoneno"
                    placeholder="Phone No"
                    className={`${fieldClass(!!errors.phoneno)} tabular-nums`}
                    {...register("phoneno", {
                      required: "Phone no is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a 10 digit phone number",
                      },
                    })}
                  />
                  {errors.phoneno && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.phoneno.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="country"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Country <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="country"
                    placeholder="Country"
                    className={fieldClass(!!errors.country)}
                    {...register("country", {
                      required: "Country is required",
                      pattern: {
                        value: /^[A-Za-z][A-Za-z\s'.-]*$/,
                        message: "Letters only",
                      },
                    })}
                  />
                  {errors.country && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="state"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  State <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="state"
                    placeholder="State"
                    className={fieldClass(!!errors.state)}
                    {...register("state", {
                      required: "State is required",
                      pattern: {
                        value: /^[A-Za-z][A-Za-z\s'.-]*$/,
                        message: "Letters only",
                      },
                    })}
                  />
                  {errors.state && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="city"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  City <span className="text-rose-600">*</span>
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="city"
                    placeholder="City"
                    className={fieldClass(!!errors.city)}
                    {...register("city", {
                      required: "City is required",
                      pattern: {
                        value: /^[A-Za-z][A-Za-z\s'.-]*$/,
                        message: "Letters only",
                      },
                    })}
                  />
                  {errors.city && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-12 items-start gap-4">
                <label
                  htmlFor="photo"
                  className="col-span-12 pt-2 text-sm text-slate-600 sm:col-span-3"
                >
                  Photo
                </label>
                <div className="col-span-12 sm:col-span-6">
                  <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    className={`${fieldClass(
                      !!errors.photo,
                    )} cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-sm file:text-slate-700 hover:file:bg-slate-300`}
                    {...register("photo", {
                      validate: {
                        size: (files) =>
                          !files?.[0] ||
                          files[0].size <= MAX_PHOTO ||
                          "Image must be 2MB or smaller",
                        type: (files) =>
                          !files?.[0] ||
                          ["image/jpeg", "image/png"].includes(files[0].type) ||
                          "Only JPG or PNG images",
                      },
                    })}
                  />

                  {errors.photo ? (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.photo.message}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-400">
                      {currentPhoto
                        ? "Leave empty to keep the current photo."
                        : "Optional. JPG or PNG, up to 2MB."}
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
                    {isSubmitting ? "Updating…" : "Update"}
                  </button>
                  <Link
                    to="/students"
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
