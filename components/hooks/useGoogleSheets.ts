
import { useState, useEffect } from 'react';
import { SalesData } from '@/types/dashboard';

const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "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",
  REFRESH_TOKEN: import.meta.env.VITE_GOOGLE_REFRESH_TOKEN || "1//04MmvT_BibTsBCgYIARAAGAQSNwF-L9IrG9yxJvvQRMLPR39xzWSrqfTVMkvq3WcZqsDO2HjUkV6s7vo1pQkex4qGF3DITTiweAA",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID || "149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI";

export const useGoogleSheets = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const response = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
          refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      
      if (tokenData.error) {
        if (tokenData.error === 'invalid_grant') {
          throw new Error('Google OAuth token has expired. Please regenerate the refresh token.');
        }
        throw new Error(`OAuth error: ${tokenData.error} - ${tokenData.error_description}`);
      }
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from Google OAuth');
      }
      
      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sales?alt=json`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const rows = result.values || [];
      
      if (rows.length < 2) {
        setData([]);
        return;
      }

      const headers = rows[0];
      const salesData: SalesData[] = rows.slice(1).map((row: any[]) => ({
        memberId: row[0] || '',
        customerName: row[1] || '',
        customerEmail: row[2] || '',
        saleItemId: row[3] || '',
        paymentCategory: row[4] || '',
        membershipType: row[5] || '',
        paymentDate: row[6] || '',
        paymentValue: parseFloat(row[7]) || 0,
        paidInMoneyCredits: parseFloat(row[8]) || 0,
        paymentVAT: parseFloat(row[9]) || 0,
        paymentItem: row[10] || '',
        paymentStatus: row[11] || '',
        paymentMethod: row[12] || '',
        paymentTransactionId: row[13] || '',
        stripeToken: row[14] || '',
        soldBy: row[15] || '',
        saleReference: row[16] || '',
        calculatedLocation: row[17] || '',
        cleanedProduct: row[18] || '',
        cleanedCategory: row[19] || '',
      }));

      setData(salesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sales data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  return { data, loading, error, refetch: fetchSalesData };
};
