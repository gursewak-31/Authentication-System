import SideBar from "../components/sidebar";
import "../style.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AccountSettings(){
    let redirect = useNavigate();
    let [currPassword, setCurrPassword] = useState("");
    let [newPassword, setNewPassword] = useState("");
    let [confPassword, setConfPassword] = useState("");
    let [showCurrPassword, setShowCurrPassword] = useState(false);
    let [showNewPassword, setShowNewPassword] = useState(false);
    let [showConfPassword, setShowConfPassword] = useState(false);
    let [deleteCheck, setDeleteCheck] = useState(false);
    let [updateResponse, setUpdateResponse] = useState<{status: "success" | "failed", msg: string} | null>(null);
    let [deleteResponse, setDeleteResponse] = useState<{status: "success" | "failed", msg: string} | null>(null);

    async function changePassword(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(newPassword !== confPassword){
            setUpdateResponse({status: "failed", msg: "New and Confirm password doesn't match!"});
            return;
        }
        if(!/^.{8,}$/.test(newPassword) || !/^.{8,}$/.test(confPassword)){
            setUpdateResponse({status: "failed", msg: "Password must be at least 8 characters long."});
            return;
        }

        try{
            let req = await fetch("http://localhost:3001/changePassword", {
                        credentials: "include",
                        method: "POST",
                        body: JSON.stringify({
                            newPass: newPassword,
                            currPass: currPassword
                        })
                    });

            let res = await req.json();

            if(req.status === 401){
                setUpdateResponse({status: "failed", msg: res.msg});
                setTimeout(() => redirect("/login"), 3000);
                return;
            }

            if(!req.ok){
                setUpdateResponse({status: "failed", msg: res.msg});
                return;
            }

            setUpdateResponse({status: "success", msg: res.msg})
            setNewPassword("");
            setCurrPassword("");
            setConfPassword("");
        }catch(err){
            setUpdateResponse({status: "success", msg: "Something went wrong, please try again!"});
        }
    }

    async function deleteAccount(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        if(!deleteCheck) return;
        try{
            let req = await fetch("http://localhost:3001/deleteAccount", {
                        method: "POST",
                        credentials: "include"
                    });
            
            let res = await req.json();

            if(req.status === 401){
                setDeleteResponse({status: "failed", msg: res.msg});
                setTimeout(() => redirect("/login"), 3000);
                return;
            }

            if(!req.ok){
                setDeleteResponse({status: "failed", msg: res.msg});
                return;
            }

            setDeleteResponse({status: "success", msg: res.msg});
            setTimeout(() => redirect("/login"), 3000);
        }catch(err){
            setDeleteResponse({status: "failed", msg: "Something went wrong, please try again!"});
        }
    }

    useEffect(() => {
        if(updateResponse) setTimeout(() => setUpdateResponse(null), 3000)
    }, [updateResponse])

    return(
        <>
        <div className="container-fluid g-0 bg-body-secondary min-vh-100">
            <div className="row g-0 min-vh-100">
                <SideBar currPage = "account-settings"></SideBar>
                <div className="col-md-9 col-lg-10 p-4 p-md-5">
                    <div className="max-width-container mx-auto" style={{ maxWidth: '900px' }}>
                        {/* PAGE HEADER */}
                        <div className="mb-5">
                            <h1 className="h3 mb-1 text-gray-900 fw-bold">Login &amp; Security</h1>
                            <p className="text-muted small">Manage your security credentials and account status options.</p>
                        </div>

                        <div className="d-flex flex-column gap-4">
                            {/* SECTION 1: CHANGE PASSWORD FORM */}
                            <div className="card border-0 shadow-sm p-4 bg-white">
                                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                    <i className="bi bi-key text-primary fs-5"></i>
                                    <h5 className="fw-bold mb-0 text-gray-800">Update Password</h5>
                                </div>
                    
                                <form onSubmit={changePassword}>
                                    <div className="row g-3">
                                        {/* Current Password Field */}
                                        <div className="col-12">
                                            <label className="form-label text-muted small fw-medium">Current Password</label>
                                            <div className="input-group">
                                                <input type={showCurrPassword ? "text" : "password"} className="form-control bg-body-secondary border-0 py-2" placeholder="Enter current password" value={currPassword} onChange={(e) => setCurrPassword(e.target.value)}/>

                                                <button type="button" className="btn bg-body-secondary border-0 text-muted" onClick={() => setShowCurrPassword(!showCurrPassword)}>
                                                    <i className={`bi ${showCurrPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password Field */}
                                        <div className="col-12 d-flex gap-4">
                                            <div className="w-50">
                                                <label className="form-label text-muted small fw-medium">New Password</label>
                                                <div className="input-group">
                                                    <input type={showNewPassword ? "text" : "password"} className="form-control bg-body-secondary border-0 py-2" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>

                                                    <button type="button" className="btn bg-body-secondary border-0 text-muted" onClick={() => setShowNewPassword(!showNewPassword)}>
                                                        <i className={`bi ${showNewPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="w-50">
                                                <label className="form-label text-muted small fw-medium">Confirm Password</label>
                                                <div className="input-group">
                                                    <input type={showConfPassword ? "text" : "password"} className="form-control bg-body-secondary border-0 py-2" placeholder="Confirm new password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)}/>

                                                    <button type="button" className="btn bg-body-secondary border-0 text-muted" onClick={() => setShowConfPassword(!showConfPassword)}>
                                                        <i className={`bi ${showConfPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {updateResponse && (
                                            <div className={`form-text small ${updateResponse.status == "success" ? "text-success" : "text-danger"}`}>*{updateResponse.msg}</div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                                        <button type="submit" className="btn btn-primary px-4 shadow-sm">Save New Password</button>
                                    </div>
                                </form>
                            </div>

                            {/* SECTION 2: DESTRUCTIVE ZONE (DELETE ACCOUNT) */}
                            <div className="card border-0 shadow-sm p-4 bg-white border-start border-4 border-danger">
                                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                                    <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                                    <h5 className="fw-bold mb-0 text-danger">Danger Zone</h5>
                                </div>
                                
                                <p className="text-muted small mb-4">
                                    Deleting your account is permanent. Once completed, your workspace profiles, configurations, data repositories, and subscription provisions are completely removed and cannot be recovered.
                                </p>

                                <form onSubmit={deleteAccount}>
                                    <div className="bg-danger-subtle p-3 rounded-3 mb-4 border border-danger-subtle">
                                        <div className="form-check d-flex align-items-start m-0">
                                            <input className="form-check-input border-danger me-2 mt-1" type="checkbox" id="confirmDeleteCheck" onChange={() => setDeleteCheck(!deleteCheck)}/>
                                            <label className="form-check-label small fw-semibold text-danger-emphasis" htmlFor="confirmDeleteCheck">
                                                I understand that this action is irreversible and I intentionally wish to wipe out my account files completely.
                                            </label>
                                        </div>
                                    </div>

                                    {deleteResponse && (
                                        <div className={`form-text small ${deleteResponse.status == "success" ? "text-success" : "text-danger"}`}>*{deleteResponse.msg}</div>
                                    )}

                                    <div className="d-flex justify-content-start">
                                        <button type="submit" className="btn btn-danger px-4 shadow-sm py-2 fw-medium" disabled = {!deleteCheck}>
                                            <i className="bi bi-trash3-fill me-2"></i>Permanently Delete Account
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}