import { useContext, createContext, useEffect, useState } from "react";
import axios from "axios"

const AuthContext = createContext()

const frontendURL = import.meta.env.VITE_REACT_APP_FRONTEND_URL


export const AuthProvider = ({children}) => {

    const [loggedIn, setLoggedIn] = useState(false)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)


    axios.defaults.withCredentials = true;
    const refreshAccessToken = async ({setToken, setLoggedIn, setUser, logOut}) => {
        try {
            const storedToken = window.localStorage.getItem("token")
            if(!storedToken) {
                return
            }

            const response = await axios.post(`${frontendURL}/refresh_token`, {}, {
                headers:{"Content-Type": "application/json", "Authorization": `Bearer ${storedToken}`}
            })
            
            if(response.status === 200) {
                const userData = response.data;
                setToken(userData.token);
                setLoggedIn(true)
                setUser(userData)
            } else {
                console.error("Token verification failed with status:", response.status)
                logOut()
            }
            
        } catch (error) {
            console.error("Error refreshing access token", error)
            logOut()
        }
    }

    useEffect(() => {
        const storedToken = window.localStorage.getItem("token")

        const refreshAccessTokenHandler = () => {
            refreshAccessToken({setToken, setLoggedIn, setUser, logOut})
        }

        if(loggedIn && storedToken) {
            setLoggedIn(true);

            const refreshAccessTokenInterval = setInterval(() => {
                refreshAccessTokenHandler()
            }, 50 * 1000);

            return () => {
                clearInterval(refreshAccessTokenInterval)
            }
        } else {
            refreshAccessTokenHandler()
        }

    }, [loggedIn, token, setToken, setLoggedIn, setUser])

    const login = (userData, token) => {
        setLoggedIn(true)
        setUser(userData)
        window.localStorage.setItem("token", token)
        setToken(token)
    }
    
    const logOut = () => {
        setLoggedIn(false)
        setUser(null)
        setToken(null)

        window.localStorage.removeItem("token")
    }

    return (
        <AuthContext.Provider value={{loggedIn, login, logOut, user, token}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)