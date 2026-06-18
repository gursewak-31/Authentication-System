import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function SideBar({ currPage }: {currPage: string}){
    let redirect = useNavigate();
    let activeClass = "nav-link active bg-primary text-white";
    let inActiveClass = "nav-link text-white-50 hover-white";

    function logout(){
        fetch("http://localhost:3001/logout", {
            method: "POST",
            credentials: "include"
        }).then((res) => res.json())
        .then((d) => {
            if(d.status == "ok"){
                redirect("/login");
            }
        })
    }

    return (
        <>
            <div className="col-md-3 col-lg-2 bg-dark text-white p-3 d-flex flex-column justify-content-between position-sticky top-0 h-md-100" id="sidebar">
                <div>
                    <div className="d-flex align-items-center mb-4 me-md-auto text-white text-decoration-none fs-4 fw-bold p-2">
                        <i className="bi bi-shield-lock-fill me-2 text-primary"></i>
                        <span>SecureAuth</span>
                    </div>

                    <hr className="text-white-50" />
                        
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item mb-2">
                            <Link to = "/dashboard" className = {currPage == "dashboard" ? activeClass : inActiveClass} aria-current="page">
                                <i className="bi bi-person-circle me-2"></i> My Profile
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to = "/account-settings" className={currPage == "account-settings" ? activeClass : inActiveClass}>
                                <i className="bi bi-shield-check me-2"></i> Account Settings
                            </Link>
                        </li>
                        {/* <li className="nav-item mb-2">
                            <a href="#" className="nav-link text-white-50 hover-white">
                                <i className="bi bi-bell me-2"></i> Notifications
                            </a>
                        </li> */}
                    </ul>
                </div>

                {/* QUICK LOGOUT PINNED TO BOTTOM */}
                <div className="border-top border-secondary pt-3">
                    <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm" onClick={logout}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    )
}