import { makeHttpReq } from "@/helper/makeHttpReq";
import { showError } from "@/util/toast-notification";

export async function addPaymentMethod({ userId, email }: { userId: string, email: string }) {

    try {

        const data = await makeHttpReq('POST', `notes/payment/create-setup-session`, { userId, email }) as { url: string }
        window.open(data?.url)

    } catch (error: any) {
        console.log('error :', error?.message)
        throw error;
    }
}



export async function buyCredit({ userId, email, amount }: { userId: string, email: string, amount: number }) {

    try {

        const data = await makeHttpReq('POST', `notes/payment/charge-customer`, { userId, email, amount }) as { message: string }
        return data
    } catch (error: any) {
        showError(error?.message)
        throw error;
    }
}


export const getUserCreditAndPaymentMethod = async (userId: string) => {
    try {

        const data = await makeHttpReq('GET', `notes/payment/user-credits?userId=${userId}`)
        return data
    } catch (error: any) {
        showError(error?.error?.message || error?.message)
        throw error;
    }

};
