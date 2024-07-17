import * as CryptoJS from 'crypto-js';
import { CIPHERS } from './env';

const encrypt = (content_: any): string => {
  let content;
  if (typeof content_ === 'string') {
    content = content_;
  } else {
    content = JSON.stringify(content_);
  }
  console.log(CIPHERS);

  return CryptoJS.AES.encrypt(content, CIPHERS.AES).toString();
};

/**
 *
 * @param cipher
 * @param needObject 是否将string结果转换为object
 */
const decrypt = (cipher: string, needObject = false) => {
  const originalText = CryptoJS.AES.decrypt(cipher, CIPHERS.AES).toString(
    CryptoJS.enc.Utf8
  );
  if (!needObject) {
    return originalText;
  }

  return JSON.parse(originalText);
};

const AesUtils = {
  encrypt,
  decrypt,
};
export default AesUtils;
