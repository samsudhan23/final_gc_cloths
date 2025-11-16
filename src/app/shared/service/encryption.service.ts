import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly secretKey = 'GC_CLOTHS_SECRET_KEY_2024'; // Change this to a secure key

  /**
   * Encrypts a string using simple Base64 encoding with a secret key
   * Note: This is a simple encryption for URL safety. For production, consider using stronger encryption.
   */
  encrypt(text: string): string {
    try {
      // Combine text with secret key for basic obfuscation
      const combined = `${this.secretKey}${text}${this.secretKey}`;
      // Encode to Base64
      const encoded = btoa(combined);
      // URL encode to make it safe for URLs
      return encodeURIComponent(encoded);
    } catch (error) {
      console.error('Encryption error:', error);
      return text;
    }
  }

  /**
   * Decrypts an encrypted string
   */
  decrypt(encryptedText: string): string {
    try {
      // URL decode first
      const urlDecoded = decodeURIComponent(encryptedText);
      // Decode from Base64
      const decoded = atob(urlDecoded);
      // Remove secret key from both ends
      const secretKeyLength = this.secretKey.length;
      if (decoded.startsWith(this.secretKey) && decoded.endsWith(this.secretKey)) {
        return decoded.substring(secretKeyLength, decoded.length - secretKeyLength);
      }
      // If format doesn't match, return as is (might be old format)
      return decoded;
    } catch (error) {
      console.error('Decryption error:', error);
      // Try to return the original if decryption fails
      try {
        return decodeURIComponent(encryptedText);
      } catch {
        return encryptedText;
      }
    }
  }
}

