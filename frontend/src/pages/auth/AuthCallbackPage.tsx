import { getAuthUserData } from "@/api/auth"
import { useEffect } from "react"

function AuthCallbackPage() {


    const getUserData = async () => {
        try {
            const data = await getAuthUserData()
            console.log("Auth data received:", data)
            if (data) {
                const { _id, name, email, image,googleAccessToken, ...resProps } = data
                const user = { _id, name, email, image ,googleAccessToken}
                console.log("Saving user to localStorage:", user)
                localStorage.setItem('userData', JSON.stringify(user))
                window.location.href='/notes'
            }

        } catch (error) {
            console.error("Failed to get auth user data:", error)
        }
    }

    useEffect(() => {
        getUserData()
    }, [])



    return (
        <>
            <div>
                Authenticate....
            </div>
        </>
    )
}

export default AuthCallbackPage
