import { NavLink } from "react-router-dom";

const links = [
  { to: "/books", label: "Books" },
  { to: "/issues", label: "Issues" },
  { to: "/students", label: "Students" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-binding text-white md:flex bg-gray-950">
      <div className="border-b border-white px-6 py-[17.5px]">
        <p className="leading-tight font-semibold text-yellow-500">Library Management</p>
      </div>

      <nav className="flex-1 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                "flex items-center border-l-2 px-6 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-brass bg-binding-soft font-medium text-yellow-500"
                  : "border-transparent text-white/70 hover:bg-binding-soft/60 hover:text-yellow-500",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
