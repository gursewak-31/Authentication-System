import React, { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import type { User } from "../types"
import { useNavigate, Link } from "react-router-dom";

export function Dashboard(){
    let [user, setUser] = useState<User | null>(null);
    let [isModalOpen, setIsModalOpen] = useState(false);
    let [updateRespone, setUpdateResponse] = useState<string | null>(null);
    let redirect = useNavigate();

    useEffect(() => {
        getData();
    }, []);

    async function getData(){
        try{
            let req = await fetch("http://localhost:3001/user", {
                    method: "GET",
                    credentials: "include"
                });

            if(!req.ok || req.status != 200){
                throw new Error("request failed");
            }

            let res = await req.json();

            if(res.status == "ok")
                setUser(res.data);
            else
                redirect("/login");
        }catch(err){
            redirect("/login");
        }
    }

    async function updateData(e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault()
        try{
            let req = await fetch("http://localhost:3001/updateUser", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user),
                        credentials: "include"
                    });

            if(!req.ok || req.status != 200){
                throw new Error("request failed");
            }

            let res = await req.json();

            if(res.status == "ok"){
                setUpdateResponse("success");
                if(user) setUser({...user, lastUpdate: new Date()})
            }else{
                setUpdateResponse("failed");
            }
        }catch(err){
            setUpdateResponse("failed");
        }
        setTimeout(() => setUpdateResponse(null), 3000);
    }

    async function updateProfileImage(image: File | null){
        let formData = new FormData();
        formData.append("id", String(user?.id) ?? "");
        formData.append("profileImage", image ?? "");
        formData.append("oldImageName", user?.profileImage ?? "");

        try{
            let req = await fetch("http://localhost:3001/updateProfileImage", {
                        method: "POST",
                        credentials: "include",
                        body: formData
                    });

            if(!req.ok || req.status != 200){
               throw new Error("request failed");
            }

            let res = await req.json();

            if(res.status == "ok"){
                setUpdateResponse("success");
                if(user) setUser({...user, lastUpdate: new Date(), profileImage: res.image});
            }else{
                setUpdateResponse("failed");
            }
        }catch(err){
            setUpdateResponse("failed");
        }
        setIsModalOpen(false);
        setTimeout(() => setUpdateResponse(null), 3000);
    }

    if(!user) return (<div>Loading</div>)
    return(
        <>
        <div className="container-fluid g-0 bg-body-secondary min-vh-100">
            <div className="row g-0 min-vh-100">
        
                {/* SIDEBAR NAVIGATION */}
                <SideBar currPage = "dashboard"/>

                {/* MAIN PROFILE MANAGEMENT INTERFACE */}
                <div className="col-md-9 col-lg-10 p-4 p-md-5">
                    <div className="max-width-container mx-auto" style={{ maxWidth: '900px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h1 className="h3 mb-1 text-gray-900 fw-bold">Dashboard</h1>
                                <p className="text-muted small mb-0">Manage your profile information and account security preference.</p>
                            </div>
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small d-none d-sm-inline-block">
                                <i className="bi bi-check-circle-fill me-1"></i> Verified Account
                            </span>
                        </div>

                        <div className="row g-4">
                            {/* LEFT COLUMN: VISUAL PROFILE CARD */}
                            <div className="col-12 col-lg-4">
                                <div className="card border-0 shadow-sm text-center p-4 bg-white h-100">
                                    <div className="position-relative d-inline-block mx-auto mb-3">
                                        <img src={`../assets/profileImages/${user.profileImage ? user.profileImage : 'default-user.jpg'}`} alt="Profile Avatar" className="rounded-circle border border-4 border-light shadow" style={{ width: '120px', height: '120px', objectFit: 'cover' }}/>

                                        <button className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 shadow d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} title="Change Avatar" onClick={() => setIsModalOpen(true)}>
                                            <i className="bi bi-camera-fill small"></i>
                                        </button>
                                    </div>
                                    <h5 className="fw-bold mb-1">{user.firstName} {user.lastName}</h5>
                                    <p className="text-muted small mb-3">Welcome</p>
                                    {/* <p className="text-muted small mb-0 px-2 italic">"s;dk"</p> */}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: INTERACTIVE UPDATE FORM */}
                            <div className="col-12 col-lg-8">
                                <div className="card border-0 shadow-sm p-4 bg-white">
                                    <h5 className="fw-bold text-gray-800 pb-2 border-bottom">Profile Information</h5>

                                    {updateRespone && (
                                        updateRespone == "success" ? (
                                            <div className="d-inline-flex align-items-center bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill shadow-sm animate-fade-in"> 
                                            <span className="small fw-semibold">
                                                <i className="bi bi-check-circle-fill me-2 fs-6"></i>
                                                Data updated successfully
                                            </span>
                                        </div>
                                        ) : (
                                            <div className="d-inline-flex align-items-center bg-danger-subtle text-danger border border-danger-subtle px-3 py-1.5 rounded-pill shadow-sm animate-fade-in">
                                                <span className="small fw-semibold">
                                                    <i className="bi bi-exclamation-circle-fill me-2 fs-6"></i>
                                                    Failed to update data. Please try again
                                                </span>
                                            </div>
                                        )
                                    )}

                                    <form onSubmit={(e) => updateData(e)}>
                                        <div className="row g-3 mt-1">
                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-medium">First Name</label>
                                                <input type="text" className="form-control bg-body-secondary border-0 py-2" value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})}/>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label text-muted small fw-medium">Last Name</label>
                                                <input type="text" className="form-control bg-body-secondary border-0 py-2" value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})}/>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label text-muted small fw-medium">Email Address</label>
                                                <input type="email" className="form-control bg-body-secondary border-0 py-2" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})}/>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-baseline gap-2 mt-4 pt-3 border-top">
                                            <span className="small text-muted">Last Update: {new Date(user.lastUpdate).toDateString()}</span>
                                            <div className="d-flex justify-content-end gap-2">
                                                <button type="button" className="btn btn-light px-4">Cancel</button>
                                                <button type="submit" className="btn btn-primary px-4 shadow-sm">Save Changes</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* ADDITIONAL ACCOUNT SECURITY SHORTCUTS CARD */}
                                <div className="card border-0 shadow-sm p-4 bg-white mt-4">
                                    <h5 className="fw-bold mb-3 text-gray-800">Security Credentials</h5>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                                        <div>
                                            <h6 className="mb-1 fw-semibold small">Account Password</h6>
                                            <p className="text-muted small mb-0">Change or reset the password you use to secure your login access.</p>
                                        </div>
                                        <Link to="/account-settings" type="button" className="btn btn-outline-primary btn-sm px-3 align-self-start align-self-sm-center">
                                            Change Password
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ChangeUpdatePopup
            isOpen = {isModalOpen}
            setModalOpen = {setIsModalOpen}
            updateimage = {updateProfileImage}
        />
        </>
    )
}

type ChangeUpdatePopupProps = {
    isOpen: boolean,
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    updateimage: (image: File | null) => void
}
export function ChangeUpdatePopup({isOpen, setModalOpen, updateimage}: ChangeUpdatePopupProps){

    if(!isOpen) return null;

    return(
        <>
        <div className="modal fade show d-block" tabIndex = {-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                    {/* MODAL HEADER */}
                    <div className="modal-header border-0 pt-4 pb-0 px-4 d-flex align-items-center justify-content-between">
                        <h5 className="modal-title fw-bold text-gray-900 fs-5">Profile Picture</h5>
                        <button type="button" className="btn-close shadow-none small" aria-label="Close" onClick={() => setModalOpen(false)}></button>
                    </div>

                    {/* MODAL BODY */}
                    <div className="modal-body text-center px-4 py-4">
                        <p className="text-muted small mb-4">
                        Update your profile photo to personalize your account workspace.
                        </p>

                        <div className="d-flex flex-column gap-2">
                            {/* CHANGE / UPLOAD BUTTON */}
                            <input type="file" className="d-none" id="profileImage" onChange={(e) => {
                                let file = e.target.files?.[0];
                                if(file) updateimage(file);
                            }}/>
                            <label htmlFor="profileImage" className="btn btn-primary w-100 py-2.5 fw-medium d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm">
                                <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
                                Upload New Image
                            </label>

                            {/* DELETE BUTTON */}
                            <button type="button" className="btn btn-outline-danger w-100 py-2.5 fw-medium d-flex align-items-center justify-content-center gap-2 rounded-3" onClick={() => updateimage(null)}>
                                <i className="bi bi-trash3-fill"></i>
                                Remove Current Photo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}