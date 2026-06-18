import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
// import type { User } from "../types";

export function LoginForm(){
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [invalidField, setInvalidField] = useState({email: false, pass: false});
    // let [error, setError] = useState("");
    let [showPassword, setShowPassword] = useState(false);
    let redirect = useNavigate();

    async function submitForm(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();

        if(checkFields()){
            return;
        }

        try{
            let ajax = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {email: email, password: password}
                ),
                credentials: "include"
            });
            let res = await ajax.json();
            if(res){
                redirect("/dashboard");
                // setData(res);
            }
        }catch(err){
            console.log(err);
        }
    }

    function checkFields(){
        let isInvalid = false;
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
                                    <h2 className="fw-bold mb-1 text-dark">Welcome</h2>
                                    <p className="text-muted">
                                        Enter your credentials to access your account.
                                    </p>
                                </div>

                                <form onSubmit={submitForm}>
                                    <div className="form-floating mb-3">
                                        <input type="email" className="form-control" id="loginEmail" placeholder="name@example.com" value={email} onChange={(e) => {
                                            setEmail(e.target.value);
                                            setInvalidField({...invalidField, email: false})
                                        }}/>
                                        <label htmlFor="loginEmail">Email address*</label>
                                        {invalidField.email && (
                                            <span className="invalid-field-error ps-1">
                                                *Please enter a valid email address.
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-floating mb-3 position-relative">
                                        <input type={showPassword ? "text" : "password"} className="form-control pe-5" id="loginPassword" placeholder="Password" value={password} onChange={(e) => {
                                            setPassword(e.target.value);
                                            setInvalidField({...invalidField, pass: false});
                                        }}/>
                                        <label htmlFor="loginPassword">Password*</label>
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

                                    {/* Forgot Password Link */}
                                    {/* <div className="text-end mb-4">
                                        <a href="#forgot" className="text-decoration-none small fw-medium">Forgot password?</a>
                                    </div> */}
                                    {/* {error && (
                                            <span className="invalid-field-error ps-1">
                                                *{error}
                                            </span>
                                        )} */}
                                    <button type="submit" className="btn btn-blue text-white w-100 mb-4 py-2 fw-bold">
                                        Log In
                                    </button>

                                    <div className="text-center">
                                        <span className="text-muted">Don't have an account?</span>
                                        <Link to="/signup" className="text-decoration-none text-blue fw-semibold ms-1">Sign Up</Link>
                                        {/* <a href="#signup" className="text-decoration-none fw-semibold ms-1">
                                            Sign Up
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