import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import BookList from "./pages/BookList";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import IssueList from "./pages/IssueList";
import IssueBook from "./pages/IssueBook";
import StudentList from "./pages/StudentList";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import BookReportList from "./pages/BookReportList";
import IssueReportList from "./pages/IssueReportList";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/books" replace />} />

          <Route path="/books" element={<BookList />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/books/:id/edit" element={<EditBook />} />

          <Route path="/issues" element={<IssueList />} />
          <Route path="/issues/add" element={<IssueBook />} />

          <Route path="/students" element={<StudentList />} />
          <Route path="/students/add" element={<AddStudent />} />

          <Route path="/students/:id/edit" element={<EditStudent />} />

          <Route path="/reports" element={<BookReportList />} />
          <Route path="/issue-report" element={<IssueReportList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  );
}
