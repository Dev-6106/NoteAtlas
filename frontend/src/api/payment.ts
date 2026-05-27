import { makeHttpReq } from "@/helper/makeHttpReq";

export const buyCredit = async ({
  userId,
  amount,
  email,
}: {
  userId: string;
  amount: number;
  email: string;
}) => {
  const { data } = await makeHttpReq<{ url?: string; message?: string }>(
    "/api/v1/notes/payment/create-setup-session",
    { method: "POST", body: { userId, amount, email } }
  );

  if (data?.url) {
    window.location.href = data.url;
  }
  return data;
};

export const chargeCustomer = async ({
  userId,
  credits,
}: {
  userId: string;
  credits: number;
}) => {
  const { data } = await makeHttpReq<{ message: string }>(
    "/api/v1/notes/payment/charge-customer",
    { method: "POST", body: { userId, credits } }
  );
  return data;
};

export const getUserCreditAndPayment = async (userId: string) => {
  const { data } = await makeHttpReq<{ credits: number; paymentType: string }>(
    `/api/v1/notes/payment/user-credits?userId=${userId}`
  );
  return data;
};
