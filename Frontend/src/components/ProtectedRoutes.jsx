import {useAuth} from "./AuthContex"
import {Outlet} from "react-router-dom"

import Home from "./Home"


const ProtectedRoutes = () => {

    const {loggedIn} = useAuth()

    return (
        <div>
            {loggedIn ? (
                <Outlet />
            ) : (
                <Home />
            )}
        </div>
    )
}

export default ProtectedRoutes