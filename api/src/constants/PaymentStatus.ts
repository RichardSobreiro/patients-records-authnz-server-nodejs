/** @format */
class PaymentStatus {
  static readonly REGISTERING = new PaymentStatus(
    "REGISTERING",
    "Finalizando o cadastro."
  );
  static readonly OK = new PaymentStatus(
    "OK",
    "Tudo certo com o seu pagamento."
  );
  static readonly NOTOK = new PaymentStatus(
    "NOTOK",
    "Seu pagamento expirou! Realize um novo pagamento para continuar usando a plataforma Portal Atender."
  );
  static readonly PROCESSING = new PaymentStatus(
    "PROCESSING",
    "O seu pagamento está sendo processado. Aguarde!"
  );
  static readonly TESTING = new PaymentStatus("TESTING", "Período de testes.");
  static readonly TESTINGENDED = new PaymentStatus(
    "TESTING",
    "Seu período de testes expirou! Realize o pagamento para continuar usando a plataforma Portal Atender."
  );
  static readonly ERROR = new PaymentStatus(
    "ERROR",
    "Ocorreu um erro com o seu pagamento."
  );

  private constructor(
    private readonly key: string,
    public readonly value: any
  ) {}

  toString() {
    return this.key;
  }
}

export default PaymentStatus;
