import parsePhoneNumber, {
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

export class PhoneUtil {
  /**
   * Validate and normalize phone number to E.164 format
   * E.164 format: +[country code][number] (e.g., +201234567890)
   */
  static normalize(
    phone: string,
    defaultCountry: CountryCode = 'EG',
  ): string | null {
    try {
      // Remove spaces and dashes
      const cleaned = phone.replace(/[\s-]/g, '');

      // Check if valid
      if (!isValidPhoneNumber(cleaned, defaultCountry)) {
        return null;
      }

      // Parse and format to E.164
      const phoneNumber = parsePhoneNumber(cleaned, defaultCountry);
      return phoneNumber?.format('E.164') || null;
    } catch {
      return null;
    }
  }

  /**
   * Validate phone number
   */
  static isValid(phone: string, defaultCountry: CountryCode = 'EG'): boolean {
    try {
      const cleaned = phone.replace(/[\s-]/g, '');
      return isValidPhoneNumber(cleaned, defaultCountry);
    } catch {
      return false;
    }
  }

  /**
   * Get country code from phone number
   */
  static getCountryCode(phone: string): string | null {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.country || null;
    } catch {
      return null;
    }
  }

  /**
   * Format phone for display (e.g., "+20 123 456 7890")
   */
  static formatForDisplay(phone: string): string | null {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.formatInternational() || null;
    } catch {
      return null;
    }
  }
}
