import { Outlet, NavLink } from "react-router-dom";

import navbarstyle from '../styles/navbarstyle.module.css'

const Navbar = () => {


    return (
        <div className={navbarstyle.mainContainer}>
            <Outlet /> 
        </div>
    );
};

export default Navbar;
