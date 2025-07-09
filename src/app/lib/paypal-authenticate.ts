// lib/paypal.ts
import axios from 'axios';
import qs from 'qs';

const PAYPAL_API_BASE = 'https://api-m.paypal.com';

export async function getPayPalAccessToken(client_id: string, client_secret: string): Promise<string> {
  const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  //const basicAuth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Failed to get PayPal access token:', error.response?.data || error.message);
    throw new Error('PayPal authentication failed');
  }
}
