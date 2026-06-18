import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Route, Routes } from "react-router-dom";
import { LoginForm } from "./pages/login-page";
import { SignUpFrom } from "./pages/signup-page";
import { Dashboard }  from "./pages/dashboard";
import { AccountSettings }  from "./pages/account-settings";
import "./style.css";
import type { User } from './types';
import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Main(){
    let [user, setUser] = useState<User | null>(null);
    let redirect = useNavigate();

    // useEffect(() => {
    //     if(user) redirect("/dashboard");
    // }, [user]);

    return(
        <>
            <Routes>
                <Route path = "/login" element = {<LoginForm setData = {setUser} />}></Route>
                <Route path = "/signup" element = {<SignUpFrom/>}></Route>
                <Route path = "/dashboard" element = {<Dashboard />}></Route>
                <Route path = "/" element = {<Navigate to = "/dashboard" />}></Route>
                <Route path = "/account-settings" element = {<AccountSettings/>}></Route>
            </Routes>
        </>
    )
}