import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { to: "/", label: "Home" },
        { to: "/songs", label: "Songs" },
        { to: "/albums", label: "Albums" },
        { to: "/signin", label: "Đăng nhập" },
        { to: "/signup", label: "Đăng ký" },
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-black shadow px-4 py-3 mt-0">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <img src="/images/icon.png" alt="Logo" width="50" height="50" />
                    <span className="text-danger fw-bold fs-3">MUSICRESU</span>
                </Link>


                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-3">
                        {links.map(({ to, label }) => (
                            <li className="nav-item" key={to}>
                                <Link
                                    to={to}
                                    className={
                                        "nav-link " +
                                        (location.pathname === to
                                            ? "active text-danger fw-semibold"
                                            : "text-secondary")
                                    }
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
