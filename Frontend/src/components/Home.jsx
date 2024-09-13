import {useState, useRef, useEffect } from "react"
import {useNavigate} from "react-router-dom"
import axios from "axios"
import socket from "../socket"
import { useAuth } from "./AuthContex"
import Cookies from "js-cookie"

import homestyle from "../styles/homestyle.module.css"

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);



const Home = () => {

    const {login} = useAuth()

    const navigate = useNavigate()

    const logInRef = useRef(null)
    const loginFormBttnRef = useRef(null)
    const signUpbttnRef = useRef(null)
    const signUpFormRef = useRef(null)
    const mainContRef = useRef(null)

    // const [logo, setLogo] = useState(false)
    const [showLoginForm, setShowLoginForm] = useState(true)
    const [showSignUpButton, setShowignUpButton] = useState(true)
    const [showSignUpWrapper, setShowSignUpWrapper] = useState(false)
    const [showLoginButton, setShowLoginButton] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const [inputData, setInputData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        pwd: ""
    })
    const [loginData, setLogiInData] = useState({
        username: "",
        pwd: ""
    })


    useGSAP(() => {
        gsap.fromTo(
            mainContRef.current,
            { opacity: 0 }, 
            { opacity: 1, duration: 1.5, delay: 5 } 
        );
    }, []); 

    const handleShowSignUP = (e) => {
        e.preventDefault();

        setShowLoginForm(false)
        setShowignUpButton(false)
        setShowSignUpWrapper(true)
        setShowLoginButton(true)
    };

    const handleshowLoginClick = (e) => {
        e.preventDefault();

        setShowSignUpWrapper(false)
        setShowLoginButton(false)
        setShowLoginForm(true)
        setShowignUpButton(true)
        
    };

    const handleUserInput = (e) => {
        const {name, value} = e.target
        setInputData((prev) => ({...prev, [name] : value}))
    }

    const handleDataSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3001/register", inputData, {
                headers: {"Content-Type": "application/json"}
            });
    
            if (response.status === 200) {
                console.log("Data submitted to database successfully");
            }

            setInputData({
                firstname: "",
                lastname: "",
                email: "",
                username: "",
                pwd: ""
            })

            navigate("/")

        } catch (error) {
            console.log("Error submitting data:", error);
        }
    };
    
    const handleLoingInputData = (e) => {
        const {name, value} = e.target
        setLogiInData((prev) => ({...prev, [name]: value}))
    }

    axios.defaults.withCredentials = true
    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:3001/login", loginData, {
                headers: {"Content-Type": "application/json"}
            }) 

            console.log("Response data", response.data.message)

            if(response.status === 200) {

                const token = Cookies.get("token")

                const {userData} = response.data;
                
                socket.emit("setUsername", userData.username)
                
                login(userData, token)


                setLogiInData({
                    username: "",
                    pwd: ""
                })
            }

            navigate("/join")

        } catch (error) {
            console.log("Error loging in user", error)
            setErrorMsg(error.response.data.message)
            setTimeout(() => {
                setErrorMsg("")
            }, 2000);
        }
    }


    

    useEffect(() => {
        const logo = document.querySelectorAll(`.${homestyle.logo} path`);
        const logoArray = Array.from(logo);

        for(let i = 0; i < logoArray.length; i++){
            console.log(`Letter ${i} is ${logo[i].getTotalLength()}`)
        }

    }, [homestyle.logo]);
    


    return (
        <div className={homestyle.mainContainer}>

            <svg width="801" height="114" viewBox="0 0 801 114" fill="none" xmlns="http://www.w3.org/2000/svg" className={homestyle.logo}>
                <path d="M798.961 98.472V96.972H797.461H787.813C783.905 96.972 781.569 96.2145 780.362 95.0911C779.158 93.8743 778.369 91.6357 778.369 87.96V42.948H797.461H798.961V41.448V30.648V29.148H797.461H778.369V10.776V9.27599H776.869H763.765H762.265V10.776V29.148H753.541H752.041V30.648V41.448V42.948H753.541H762.265V87.96C762.265 95.832 764.13 101.855 768.221 105.623C772.252 109.336 778.155 111.06 785.653 111.06H797.461H798.961V109.56V98.472Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M676.209 33.0963L676.209 33.0963L676.2 33.1019C670.287 36.6096 665.636 41.5693 662.25 47.94C658.851 54.241 657.177 61.5484 657.177 69.816C657.177 77.994 658.853 85.3419 662.244 91.8232C665.626 98.289 670.273 103.346 676.184 106.952C682.096 110.56 688.705 112.356 695.973 112.356C703.013 112.356 709.235 110.817 714.586 107.687L714.594 107.682C718.369 105.445 721.509 102.798 723.993 99.7349V109.56V111.06H725.493H738.741H740.241V109.56V30.648V29.148H738.741H725.493H723.993V30.648V40.1649C721.587 37.2116 718.54 34.6655 714.874 32.5212C709.519 29.3892 703.249 27.852 696.117 27.852C688.857 27.852 682.21 29.5956 676.209 33.0963ZM711.334 45.6169L711.352 45.6276L711.37 45.6378C715.234 47.7946 718.302 50.9412 720.575 55.1243C722.835 59.2832 723.993 64.2121 723.993 69.96C723.993 75.7043 722.837 80.6851 720.572 84.9458C718.297 89.1286 715.226 92.3269 711.352 94.5801C707.561 96.7458 703.357 97.836 698.709 97.836C694.064 97.836 689.862 96.7472 686.073 94.5842C682.296 92.3333 679.268 89.135 676.99 84.9456C674.727 80.6883 673.569 75.6606 673.569 69.816C673.569 64.0681 674.727 59.1392 676.987 54.9803C679.265 50.7882 682.291 47.6407 686.061 45.4864C689.854 43.319 694.059 42.228 698.709 42.228C703.347 42.228 707.544 43.3612 711.334 45.6169Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M642.167 111.06H643.667V109.56V63.048C643.667 55.5685 642.241 49.1182 639.313 43.7614C636.494 38.4305 632.542 34.4149 627.462 31.7706C622.426 29.0535 616.805 27.708 610.631 27.708C604.768 27.708 599.407 28.8522 594.575 31.1673L594.575 31.1672L594.564 31.1727C591.249 32.7948 588.413 34.894 586.068 37.4687V3V1.5H584.568H571.464H569.964V3V109.56V111.06H571.464H584.568H586.068V109.56V65.928C586.068 57.9046 588.025 52.0422 591.706 48.0939C595.505 44.1214 600.607 42.084 607.175 42.084C613.657 42.084 618.605 44.0781 622.206 47.9426L622.212 47.9489L622.218 47.9551C625.801 51.7126 627.708 57.285 627.708 64.92V109.56V111.06H629.208H642.167Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M479.209 13.2196L479.209 13.2196L479.202 13.2237C471.381 17.7778 465.194 24.1178 460.651 32.2148C456.096 40.2368 453.833 49.2791 453.833 59.304C453.833 69.3304 456.097 78.3739 460.653 86.3967C465.197 94.3986 471.385 100.688 479.202 105.24L479.212 105.246L479.222 105.251C487.139 109.705 495.891 111.924 505.445 111.924C516.635 111.924 526.474 109.27 534.906 103.914L534.916 103.907C543.357 98.4457 549.503 90.7476 553.355 80.873L554.152 78.828H551.957H536.261H535.3L534.899 79.7008C532.229 85.5002 528.388 89.921 523.379 93.0184C518.475 96.0144 512.519 97.548 505.445 97.548C498.68 97.548 492.658 95.9756 487.34 92.858C482.023 89.7416 477.847 85.3441 474.804 79.6279C471.767 73.8288 470.225 67.0683 470.225 59.304C470.225 51.4378 471.769 44.6811 474.801 38.9848L474.801 38.9848L474.806 38.976C477.851 33.1618 482.028 28.7197 487.34 25.6061C492.658 22.4884 498.68 20.916 505.445 20.916C512.513 20.916 518.464 22.4947 523.366 25.5814L523.376 25.5879C528.387 28.6854 532.228 33.1068 534.899 38.9072L535.3 39.78H536.261H551.957H554.144L553.356 37.7397C549.507 27.7701 543.361 20.0209 534.916 14.5566C526.484 9.10033 516.641 6.396 505.445 6.396C495.885 6.396 487.129 8.66606 479.209 13.2196Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M357.664 109.205L357.676 109.21L357.687 109.215C362.698 111.32 368.325 112.356 374.54 112.356C380.373 112.356 385.579 111.367 390.125 109.347L390.132 109.344L390.139 109.341C394.762 107.23 398.396 104.333 400.972 100.624C403.552 96.9093 404.84 92.7211 404.84 88.104V88.089L404.84 88.074C404.738 83.0068 403.312 78.7593 400.448 75.4654C397.803 72.3141 394.587 69.9642 390.816 68.4324C387.177 66.8601 382.5 65.3049 376.808 63.7612C372.334 62.5237 368.84 61.437 366.309 60.5013C363.985 59.5142 362.05 58.277 360.482 56.8035C359.157 55.3854 358.472 53.6148 358.472 51.384C358.472 48.6302 359.609 46.4304 362.028 44.6789C364.477 42.9055 367.878 41.94 372.38 41.94C377.226 41.94 380.88 43.126 383.512 45.3333L383.521 45.3408L383.53 45.3482C386.264 47.5692 387.759 50.4894 388.02 54.2244L388.117 55.62H389.516H402.62H404.197L404.118 54.0451C403.716 45.9924 400.671 39.5312 394.932 34.8169C389.225 30.1289 381.804 27.852 372.812 27.852C366.974 27.852 361.72 28.8907 357.082 31.0058C352.464 33.0156 348.828 35.8117 346.248 39.4241C343.67 43.032 342.368 47.0314 342.368 51.384C342.368 56.7317 343.735 61.2218 346.595 64.7179L346.611 64.7371L346.627 64.7558C349.455 67.9871 352.798 70.4709 356.648 72.1932L356.669 72.2028L356.691 72.2118C360.518 73.782 365.387 75.3374 371.28 76.8829L371.28 76.883L371.291 76.8859C377.687 78.5087 382.284 80.1502 385.181 81.7794L385.196 81.7882L385.212 81.7967C386.55 82.5074 387.483 83.3766 388.088 84.3793C388.693 85.3815 389.024 86.6041 389.024 88.104C389.024 90.9559 387.835 93.3152 385.291 95.2656C382.756 97.2094 379.18 98.268 374.396 98.268C369.255 98.268 365.23 97.0775 362.195 94.8261C359.252 92.5728 357.655 89.7309 357.313 86.2303L357.181 84.876H355.82H342.284H340.691L340.787 86.4658C341.092 91.5476 342.725 96.1014 345.688 100.087L345.694 100.095L345.7 100.102C348.658 103.979 352.665 107.006 357.664 109.205Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M317.12 7.692H315.96L315.668 8.81467L307.172 41.5027L306.684 43.38H308.624H317.84H318.834L319.222 42.4643L333.046 9.77626L333.927 7.692H331.664H317.12Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M299.601 98.76V97.26H298.101H262.174L299.06 42.1382L299.313 41.7596V41.304V30.648V29.148H297.813H244.677H243.177V30.648V41.304V42.804H244.677H279.89L243.141 97.928L242.889 98.3058V98.76V109.56V111.06H244.389H298.101H299.601V109.56V98.76Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M164.897 33.0963L164.897 33.0963L164.887 33.1019C158.974 36.6096 154.323 41.5693 150.938 47.94C147.538 54.241 145.864 61.5484 145.864 69.816C145.864 77.994 147.541 85.3419 150.931 91.8232C154.313 98.289 158.96 103.346 164.871 106.952C170.784 110.56 177.393 112.356 184.66 112.356C191.7 112.356 197.922 110.817 203.274 107.687L203.281 107.682C207.056 105.445 210.197 102.798 212.68 99.7349V109.56V111.06H214.18H227.428H228.928V109.56V30.648V29.148H227.428H214.18H212.68V30.648V40.165C210.275 37.2116 207.228 34.6655 203.562 32.5212C198.207 29.3892 191.936 27.852 184.804 27.852C177.545 27.852 170.898 29.5956 164.897 33.0963ZM200.021 45.6169L200.039 45.6276L200.057 45.6378C203.922 47.7946 206.989 50.9412 209.262 55.1243C211.523 59.2832 212.68 64.2121 212.68 69.96C212.68 75.7043 211.524 80.6851 209.259 84.9458C206.985 89.1286 203.913 92.3269 200.04 94.5801C196.248 96.7458 192.044 97.836 187.396 97.836C182.751 97.836 178.55 96.7472 174.76 94.5842C170.983 92.3333 167.956 89.135 165.678 84.9456C163.414 80.6883 162.256 75.6606 162.256 69.816C162.256 64.0681 163.414 59.1392 165.674 54.9803C167.953 50.7882 170.978 47.6407 174.749 45.4864C178.541 43.319 182.747 42.228 187.396 42.228C192.035 42.228 196.232 43.3612 200.021 45.6169Z" stroke="#BC3838" strokeWidth="3"/>
                <path d="M139.361 9.60954L139.916 7.692H137.92H123.808H122.648L122.356 8.81487L101.744 88.1667L80.1835 8.79878L79.8829 7.692H78.736H64.048H62.915L62.6052 8.78185L39.9284 88.5555L19.4207 8.81837L19.131 7.692H17.968H4H2.02351L2.55532 9.5956L30.6353 110.108L30.9448 111.215L32.0949 111.204L46.6389 111.06L47.7439 111.049L48.061 109.99L70.7898 34.0921L92.7029 109.976L93.0159 111.06H94.144H108.832H109.959L110.273 109.978L139.361 9.60954Z" stroke="#BC3838" strokeWidth="3"/>
            </svg>


            <div className={homestyle.mainWrapper} ref={mainContRef}>

                {errorMsg && (<p  className={homestyle.errorMessage}>{errorMsg}</p>)}

                <form  ref={logInRef} className={ showLoginForm ? homestyle.loginWrapper : homestyle.hideLoginWrapper} encType="multipart/form data" method="POST" onSubmit={handleLoginSubmit}>
                    <h2>Log In</h2>
                    <div className={homestyle.loginInputWrapper}>
                        <label htmlFor="UserName">UserName:
                            <input type="text" id="UserName" name="username" placeholder="UserName" required value={loginData.username} onChange={handleLoingInputData}/>
                        </label>
                        <label htmlFor="Password">Password:
                            <input type="password" id="Password" name="pwd" placeholder="Password" required value={loginData.pwd} onChange={handleLoingInputData} />
                        </label>
                    </div>
                    <button type="submit">Enter</button>
                </form>

                <div ref={loginFormBttnRef}  className={showSignUpButton ? homestyle.signUpLinkButton : homestyle.hideSignUpButton}>
                    <button onClick={handleShowSignUP}>Sign up</button>
                </div>

                <form ref={signUpFormRef} className={showSignUpWrapper ? homestyle.singUpWrapper : homestyle.hideSignUpWrapper} onSubmit={handleDataSubmit} encType="multipart/form data" method="POST">
                    <h2>Sign Up</h2>
                    <label htmlFor="FirstName">
                        First Name:
                        <input type="text" name="firstname" id="FirstName" placeholder="First Name" required value={inputData.firstname} onChange={handleUserInput}/>
                    </label>

                    <label htmlFor="LastName">
                        Last Name:
                        <input type="text" name="lastname" id="LastName" placeholder="Last Name" required value={inputData.lastname} onChange={handleUserInput}/>
                    </label>

                    <label htmlFor="Email">
                        Email:
                        <input type="email" name="email" id="Email" placeholder="Email" required value={inputData.email} onChange={handleUserInput} />
                    </label>

                    <label htmlFor="UserName">
                        Username: 
                        <input type="text" name="username" id="UserName" placeholder="Username" required value={inputData.username} onChange={handleUserInput} />
                    </label>

                    <label htmlFor="Password">
                        Password:
                        <input type="password" name="pwd" id="Password" placeholder="Password" required value={inputData.pwd} onChange={handleUserInput} />
                    </label>

                        <button type="submit">Sign Up</button>
                </form>

                <div ref={signUpbttnRef} className={showLoginButton ? homestyle.logInLinkButton : homestyle.hideLoginLinkButton}>
                    <button onClick={handleshowLoginClick}>Log In</button>
                </div>
            </div>
        </div>
    )
}

export default Home