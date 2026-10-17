import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("name");

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-rule bg-white px-6">
      <p className="">
        Signed in as <span className="text-yellow-500">{userName}</span>
      </p>

      <button
        type="button"
        onClick={handleSignOut}
        className="btn-quiet cursor-pointer hover:text-yellow-400"
      >
        Sign out
      </button>
    </header>
  );
}
