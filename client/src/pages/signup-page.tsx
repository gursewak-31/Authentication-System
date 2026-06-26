import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function SignUpFrom(){
    let [firstName, setFirstName] = useState("");
    let [lastName, setLastName] = useState("");
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [showPassword, setShowPassword] = useState(false);
    let [profileImage, setProfileImage] = useState<File | null>(null)
    let [invalidField, setInvalidField] = useState({name: false, email: false, pass: false});
    let [error, setError] = useState("");
    let redirect = useNavigate();

    async function submitForm(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(checkFields()){
            return;
        }
        
        let formData =  new FormData();
        formData.append("firstname", firstName);
        formData.append("lastname", lastName);
        formData.append("email", email);
        formData.append("password", password);
        if(profileImage){
            formData.append("profilePhoto", profileImage)
        }

        try{
            let ajax = await fetch("http://localhost:3001/signup", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            let res = await ajax.json();

            if(ajax.ok){
                redirect("/dashboard");
                return;
            }

            if(ajax.status === 500)
                throw new Error();

            setError(res.msg);
        }catch(err){
            setError("Somthing went wrong. please try again later !");
        }
        setTimeout(() => setError(""), 5000);
    }

    function checkFields(){
        let isInvalid = false;
        if(!/^[a-zA-Z\s]+$/.test(firstName) || !/^[a-zA-Z\s]*$/.test(lastName)){
            setInvalidField(prev => ({
                ...prev,
                name: true
            }));
            isInvalid = true;
        }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            setInvalidField(prev => ({
                ...prev,
                email: true
            }));
            isInvalid = true;
        }
        if(!/^.{8,}$/.test(password)){
            setInvalidField(prev => ({
                ...prev,
                pass: true
            }));
            isInvalid = true;
        }
        return isInvalid;
    }

    return(
        <>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card form-card">
                            <div className="card-body p-4 p-sm-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold mb-1 text-dark">Create an Account</h2>
                                    <p className="text-muted">
                                        Set up your profile in seconds.
                                    </p>
                                </div>
                                
                                <form onSubmit={submitForm}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-sm-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="firstName" placeholder="First Name" value={firstName} onChange={(e) => {
                                                    setFirstName(e.target.value); 
                                                    setInvalidField({ ...invalidField, name: false });
                                                }} />
                                                <label htmlFor="firstName">First Name*</label>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="lastName" placeholder="Last Name" value={lastName} onChange={(e) => {
                                                    setLastName(e.target.value);
                                                    setInvalidField({ ...invalidField, name: false });
                                                }} />
                                                <label htmlFor="lastName">Last Name</label>
                                            </div>
                                        </div>
                                        {invalidField.name && (
                                            <span className="invalid-field-error ps-1">
                                                *Name should contain only letters.
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="email" placeholder="name@example.com" value={email} onChange={(e) => {
                                            setEmail(e.target.value);
                                            setInvalidField({ ...invalidField, email: false });
                                        }} />
                                        <label htmlFor="email">Email address*</label>
                                        {invalidField.email && (
                                            <span className="invalid-field-error ps-1">
                                                *Please enter a valid email address.
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-floating mb-4">
                                        <input type={showPassword ? "text" : "password"} className="form-control" id="password" placeholder="Password" value={password} onChange={(e) => {
                                            setPassword(e.target.value);
                                            setInvalidField({ ...invalidField, pass: false });
                                        }} />
                                        <label htmlFor="password">Password*</label>
                                        <button type="button" className="btn position-absolute top-50 end-0 translate-middle-y border-0 text-secondary bg-transparent" style={{ zIndex: 10 }} onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                                                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6.352-12-12 .708-.708 12 12-.708.708z"/>
                                                </svg>
                                            )}
                                        </button>

                                        {invalidField.pass && (
                                            <span className="invalid-field-error ps-1">
                                                *Password must be at least 8 characters long.
                                            </span>
                                        )}
                                    </div>

                                    <div className="col-12">
                                        <div className="form-group mb-4">
                                            {/* <label className="text-muted small fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}> Profile Image </label> */}
        
                                            <div className="form-control d-flex align-items-center justify-content-between p-2" 
                                                style={{ backgroundColor: '#2a2a2a09', borderRadius: '8px', height: '58px' }}>
                                                <div className="d-flex align-items-center ms-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#120e44" className="bi bi-image me-3" viewBox="0 0 16 16">
                                                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                                    </svg>
                                                    <div>
                                                        {profileImage ? (
                                                            <p className="m-0 text-dark small mb-0 fw-medium">{profileImage.name}</p>
                                                        ) : (
                                                            <div>
                                                                <p className="text-muted small mb-0 fw-medium">Upload Profile Image</p>
                                                                <p className="text-muted mb-0" style={{ fontSize: '0.65rem' }}>Max 2MB (PNG, JPG)</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <input type="file" id="productImage" className="d-none" accept="image/*" onChange={(e) => {
                                                    let file = e.target.files?.[0];
                                                    if(file) setProfileImage(file);
                                                }}/>
                                                <label htmlFor = "productImage" className="btn btn-blue text-white btn-sm px-3 mb-0 me-1 d-flex align-items-center" style={{ height: '38px', borderRadius: '6px' }}> Browse </label>
                                            </div>
                                        </div>  
                                    </div>

                                    {error && (
                                        <span className="invalid-field-error ps-1 mb-2">
                                            *{error}
                                        </span>
                                    )}
                                    <button type="submit" className="btn btn-blue text-white w-100 mb-4 py-2 fw-bold">
                                        Sign Up
                                    </button>

                                    <div className="text-center">
                                        <span className="text-muted">Already have an account?</span>
                                        <Link to="/login" className="text-decoration-none fw-semibold ms-1 text-blue">Log in</Link>
                                        {/* <a className="text-decoration-none fw-semibold ms-1">
                                            Log in
                                        </a> */}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}