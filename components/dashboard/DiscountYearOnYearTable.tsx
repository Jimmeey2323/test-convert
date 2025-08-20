
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DiscountYearOnYearTableProps {
  data: SalesData[];
  filters?: any;
}

export const DiscountYearOnYearTable: React.FC<DiscountYearOnYearTableProps> = ({ data, filters }) => {
  const processedData = useMemo(() => {
    const discountedData = data.filter(item => (item.discountAmount || 0) > 0);
    
    // Apply filters
    let filteredData = discountedData;
    if (filters) {
      filteredData = discountedData.filter(item => {
        if (filters.location && item.calculatedLocation !== filters.location) return false;
        if (filters.category && item.cleanedCategory !== filters.category) return false;
        if (filters.product && item.cleanedProduct !== filters.product) return false;
        if (filters.soldBy && (item.soldBy === '-' ? 'Online/System' : item.soldBy) !== filters.soldBy) return false;
        if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
        if (filters.minDiscountAmount && (item.discountAmount || 0) < filters.minDiscountAmount) return false;
        if (filters.maxDiscountAmount && (item.discountAmount || 0) > filters.maxDiscountAmount) return false;
        if (filters.minDiscountPercent && (item.grossDiscountPercent || 0) < filters.minDiscountPercent) return false;
        if (filters.maxDiscountPercent && (item.grossDiscountPercent || 0) > filters.maxDiscountPercent) return false;
        return true;
      });
    }

    // Group by year and month
    const yearMonthData = filteredData.reduce((acc, item) => {
      const date = new Date(item.paymentDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const key = `${monthName}`;
      
      if (!acc[key]) {
        acc[key] = { month: monthName, years: {} };
      }
      
      if (!acc[key].years[year]) {
        acc[key].years[year] = {
          transactions: 0,
          totalDiscount: 0,
          totalRevenue: 0,
          totalPotentialRevenue: 0,
          uniqueCustomers: new Set(),
          discountPercentages: []
        };
      }

      acc[key].years[year].transactions += 1;
      acc[key].years[year].totalDiscount += item.discountAmount || 0;
      acc[key].years[year].totalRevenue += item.paymentValue || 0;
      acc[key].years[year].totalPotentialRevenue += item.postTaxMrp || item.paymentValue || 0;
      acc[key].years[year].uniqueCustomers.add(item.customerEmail);
      acc[key].years[year].discountPercentages.push(item.grossDiscountPercent || 0);

      return acc;
    }, {} as Record<string, any>);

    // Convert to table format
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return months.map(month => {
      const monthData = yearMonthData[month];
      if (!monthData) {
        return {
          month,
          year2024: { transactions: 0, totalDiscount: 0, totalRevenue: 0, discountRate: 0, avgDiscount: 0, customers: 0 },
          year2025: { transactions: 0, totalDiscount: 0, totalRevenue: 0, discountRate: 0, avgDiscount: 0, customers: 0 },
          yoyChange: { transactions: 0, discount: 0, revenue: 0 }
        };
      }

      const data2024 = monthData.years[2024] || { transactions: 0, totalDiscount: 0, totalRevenue: 0, totalPotentialRevenue: 0, uniqueCustomers: new Set() };
      const data2025 = monthData.years[2025] || { transactions: 0, totalDiscount: 0, totalRevenue: 0, totalPotentialRevenue: 0, uniqueCustomers: new Set() };

      const year2024 = {
        transactions: data2024.transactions,
        totalDiscount: data2024.totalDiscount,
        totalRevenue: data2024.totalRevenue,
        discountRate: data2024.totalPotentialRevenue > 0 ? (data2024.totalDiscount / data2024.totalPotentialRevenue) * 100 : 0,
        avgDiscount: data2024.transactions > 0 ? data2024.totalDiscount / data2024.transactions : 0,
        customers: data2024.uniqueCustomers.size
      };

      const year2025 = {
        transactions: data2025.transactions,
        totalDiscount: data2025.totalDiscount,
        totalRevenue: data2025.totalRevenue,
        discountRate: data2025.totalPotentialRevenue > 0 ? (data2025.totalDiscount / data2025.totalPotentialRevenue) * 100 : 0,
        avgDiscount: data2025.transactions > 0 ? data2025.totalDiscount / data2025.transactions : 0,
        customers: data2025.uniqueCustomers.size
      };

      const yoyChange = {
        transactions: year2024.transactions > 0 ? ((year2025.transactions - year2024.transactions) / year2024.transactions) * 100 : 0,
        discount: year2024.totalDiscount > 0 ? ((year2025.totalDiscount - year2024.totalDiscount) / year2024.totalDiscount) * 100 : 0,
        revenue: year2024.totalRevenue > 0 ? ((year2025.totalRevenue - year2024.totalRevenue) / year2024.totalRevenue) * 100 : 0
      };

      return { month, year2024, year2025, yoyChange };
    });
  }, [data, filters]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, row) => ({
      year2024: {
        transactions: acc.year2024.transactions + row.year2024.transactions,
        totalDiscount: acc.year2024.totalDiscount + row.year2024.totalDiscount,
        totalRevenue: acc.year2024.totalRevenue + row.year2024.totalRevenue,
        customers: acc.year2024.customers + row.year2024.customers
      },
      year2025: {
        transactions: acc.year2025.transactions + row.year2025.transactions,
        totalDiscount: acc.year2025.totalDiscount + row.year2025.totalDiscount,
        totalRevenue: acc.year2025.totalRevenue + row.year2025.totalRevenue,
        customers: acc.year2025.customers + row.year2025.customers
      }
    }), { 
      year2024: { transactions: 0, totalDiscount: 0, totalRevenue: 0, customers: 0 },
      year2025: { transactions: 0, totalDiscount: 0, totalRevenue: 0, customers: 0 }
    });
  }, [processedData]);

  const columns: Array<{
    key: 'month' | 'year2024' | 'year2025' | 'yoyChange';
    header: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, item: any) => React.ReactNode;
  }> = [
    { 
      key: 'month', 
      header: 'Month', 
      align: 'left',
      render: (value: string) => <span className="font-semibold">{value}</span>
    },
    { 
      key: 'year2024', 
      header: '2024 Transactions', 
      align: 'center',
      render: (value: any) => formatNumber(value.transactions)
    },
    { 
      key: 'year2025', 
      header: '2025 Transactions', 
      align: 'center',
      render: (value: any) => formatNumber(value.transactions)
    },
    { 
      key: 'yoyChange', 
      header: 'Transaction Change', 
      align: 'center',
      render: (value: any) => (
        <Badge variant={value.transactions >= 0 ? "default" : "destructive"}>
          {value.transactions > 0 ? '+' : ''}{value.transactions.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'year2024', 
      header: '2024 Discount', 
      align: 'right',
      render: (value: any) => <span className="text-red-600 font-medium">{formatCurrency(value.totalDiscount)}</span>
    },
    { 
      key: 'year2025', 
      header: '2025 Discount', 
      align: 'right',
      render: (value: any) => <span className="text-red-600 font-medium">{formatCurrency(value.totalDiscount)}</span>
    },
    { 
      key: 'yoyChange', 
      header: 'Discount Change', 
      align: 'center',
      render: (value: any) => (
        <Badge variant={value.discount <= 0 ? "default" : "destructive"}>
          {value.discount > 0 ? '+' : ''}{value.discount.toFixed(1)}%
        </Badge>
      )
    },
    { 
      key: 'year2024', 
      header: '2024 Revenue', 
      align: 'right',
      render: (value: any) => formatCurrency(value.totalRevenue)
    },
    { 
      key: 'year2025', 
      header: '2025 Revenue', 
      align: 'right',
      render: (value: any) => formatCurrency(value.totalRevenue)
    },
    { 
      key: 'yoyChange', 
      header: 'Revenue Change', 
      align: 'center',
      render: (value: any) => (
        <Badge variant={value.revenue >= 0 ? "default" : "destructive"}>
          {value.revenue > 0 ? '+' : ''}{value.revenue.toFixed(1)}%
        </Badge>
      )
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Year-on-Year Discount Comparison (2024 vs 2025)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ModernDataTable
          data={processedData}
          columns={columns}
          showFooter={true}
          footerData={{
            month: 'TOTAL',
            year2024: totals.year2024,
            year2025: totals.year2025,
            yoyChange: {
              transactions: totals.year2024.transactions > 0 ? ((totals.year2025.transactions - totals.year2024.transactions) / totals.year2024.transactions) * 100 : 0,
              discount: totals.year2024.totalDiscount > 0 ? ((totals.year2025.totalDiscount - totals.year2024.totalDiscount) / totals.year2024.totalDiscount) * 100 : 0,
              revenue: totals.year2024.totalRevenue > 0 ? ((totals.year2025.totalRevenue - totals.year2024.totalRevenue) / totals.year2024.totalRevenue) * 100 : 0
            }
          }}
          maxHeight="500px"
          stickyHeader={true}
        />
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Year-on-Year Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-600">2024 Total Discount:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.year2024.totalDiscount)}</div>
            </div>
            <div>
              <span className="text-slate-600">2025 Total Discount:</span>
              <div className="font-semibold text-red-600">{formatCurrency(totals.year2025.totalDiscount)}</div>
            </div>
            <div>
              <span className="text-slate-600">Discount Change:</span>
              <div className={`font-semibold ${totals.year2024.totalDiscount > 0 ? 
                ((totals.year2025.totalDiscount - totals.year2024.totalDiscount) / totals.year2024.totalDiscount) * 100 > 0 ? 'text-red-600' : 'text-green-600'
                : 'text-slate-600'}`}>
                {totals.year2024.totalDiscount > 0 ? 
                  `${((totals.year2025.totalDiscount - totals.year2024.totalDiscount) / totals.year2024.totalDiscount) * 100 > 0 ? '+' : ''}${(((totals.year2025.totalDiscount - totals.year2024.totalDiscount) / totals.year2024.totalDiscount) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-slate-600">Revenue Impact:</span>
              <div className="font-semibold">{formatCurrency(totals.year2025.totalRevenue - totals.year2024.totalRevenue)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
