import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom"

import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Join from "./components/Join"
import Chat from "./components/Chat"
import { AuthProvider } from "./components/AuthContex"
import ProtectedRoutes from "./components/ProtectedRoutes"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Navbar/>}>
      <Route path= "/" element={<Home />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/Join" element={<Join />}/>
        <Route path="/Chat" element={<Chat />}/>
      </Route>
    </Route>
  )
)

function App() {
  
  return (
    <div>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  )
}

export default App
