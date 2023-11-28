/** @format */

class NotificationTypes {
  static readonly PAYMENTERROR = new NotificationTypes(
    "PAYMENTERROR",
    "Existe um problema com o seu pagamento."
  );

  private constructor(
    public readonly key: string,
    public readonly value: any
  ) {}

  toString() {
    return this.key;
  }
}

export default NotificationTypes;
