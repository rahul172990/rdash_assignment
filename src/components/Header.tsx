import { NavLink } from "react-router-dom";
import RDash from "../assets/RDash.webp";

export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <img src={RDash} className="rdash_logo" />

        <div className="links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Drag&Drop
          </NavLink>

          <NavLink
            to="/table"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Virtual Table
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
