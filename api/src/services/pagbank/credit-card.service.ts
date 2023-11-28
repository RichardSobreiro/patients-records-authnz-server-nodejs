/** @format */

export const createCreditCardPayment = async (
  paymentInstalmentId: string,
  instalmentNumber: string,
  cvc: string,
  name: string,
  firstRecurrentPayment: boolean,
  encryptedNumber?: string,
  cardToken?: string
): Promise<Response> => {
  const requestBody = {
    reference_id: paymentInstalmentId,
    description: `Instalment Number ${instalmentNumber}`,
    capture: true,
    amount: {
      value: 1990,
      currency: "BRL",
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1,
      capture: true,
      card: firstRecurrentPayment
        ? {
            encrypted: encryptedNumber,
            security_code: cvc,
            holder: {
              name: name,
            },
            store: true,
          }
        : {
            id: cardToken,
            holder: {
              name: name,
            },
            store: true,
          },
    },
    recurring: {
      type: firstRecurrentPayment ? "INITIAL" : "SUBSEQUENT",
    },
    notification_urls: [`${process.env.PAYMENTS_WEBHOOK}`],
  };

  const response = await fetch(`${process.env.PAG_BANK_ORDERS_API_URL}`, {
    method: "POST",
    headers: {
      ["Content-Type"]: "application/json",
      ["Authorization"]: `Bearer ${process.env.PAG_BANK_AUTH_TOKEN}`,
    },
    body: JSON.stringify(requestBody),
  });

  return response;
};
