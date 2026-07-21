/**
 * Normalize Ethiopian phone numbers
 *
 * Examples:
 *
 * 0912345678
 * => +251912345678
 *
 * 251912345678
 * => +251912345678
 *
 * +251912345678
 * => +251912345678
 */
export function normalizePhone(
    phone: string
  ): string {
  
    phone = phone
      .replace(/[\s\-()]/g, "")
      .trim();
  
  
    // Already international format
    if (phone.startsWith("+251")) {
      return phone;
    }
  
  
    // 251912345678
    if (phone.startsWith("251")) {
      return `+${phone}`;
    }
  
  
    // 0912345678
    if (phone.startsWith("0")) {
      return `+251${phone.substring(1)}`;
    }
  
  
    return phone;
  }
  
  
  /**
   * Validate Ethiopian phone number
   *
   * Accepted:
   *
   * +251912345678
   * 251912345678
   * 0912345678
   */
  export function isValidEthiopianPhone(
    phone: string
  ): boolean {
  
    const normalized =
      normalizePhone(phone);
  
  
    return /^\+251[79][0-9]{8}$/.test(
      normalized
    );
  }
  
  
  /**
   * Mask phone for logs
   *
   * +251912345678
   *
   * becomes:
   *
   * +25191*****678
   */
  export function maskPhone(
    phone: string
  ): string {
  
    const normalized =
      normalizePhone(phone);
  
  
    if (normalized.length < 10) {
      return normalized;
    }
  
  
    return (
      normalized.substring(0, 6) +
      "*****" +
      normalized.substring(
        normalized.length - 3
      )
    );
  }