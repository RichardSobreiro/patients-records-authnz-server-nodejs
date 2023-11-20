/** @format */

export const createCreditCardPayment = async (
  paymentInstalmentId: string,
  instalmentNumber: string,
  encryptedNumber: string,
  cvc: string,
  name: string
): Promise<Response> => {
  const requestBody = {
    reference_id: paymentInstalmentId,
    description: `Instalment Number ${instalmentNumber}`,
    amount: {
      value: 1990,
      currency: "BRL",
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1,
      capture: true,
      card: {
        encrypted: encryptedNumber,
        security_code: cvc,
        holder: {
          name: name,
        },
        store: true,
      },
    },
    recurring: {
      type: "INITIAL",
    },
    notification_urls: ["https://ap.portal-atender.com/payments/webhook"],
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
