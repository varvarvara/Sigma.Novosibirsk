import { Link } from "@tanstack/react-router";
import "./navbar.css";
export function Navbar() {
    return (
        <nav className="navbar">
            <Link className="nav-link" to="/courses" activeProps={{className:"nav-link-active"}}>Курс</Link>
            <Link className="nav-link" to="/profile" activeProps={{className:"nav-link-active"}}>Профиль</Link>
            <Link className="nav-link" to="/schedule" activeProps={{className:"nav-link-active"}}>Расписание</Link>
        </nav>
    )
}