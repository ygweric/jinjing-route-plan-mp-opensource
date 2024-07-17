import Taro from '@tarojs/taro';
import AesUtils from '../aes';

export async function fetchData(
  url: string,
  method: 'get' | 'post' | 'put' | 'delete',
  data?: any,
  header?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    Taro.request({
      url,
      data,
      header: {
        ...(header || {}),
        nonce: AesUtils.encrypt(String(Date.now())),
      },
      method: method.toUpperCase() as keyof Taro.request.Method,
      success(res) {
        resolve(res.data);
      },
      fail(err) {
        reject(err);
      },
    });
  });
}
