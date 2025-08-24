
export interface SalesData {
  memberId: string;
  customerName: string;
  customerEmail: string;
  payingMemberId: string;
  saleItemId: string;
  paymentCategory: string;
  membershipType: string;
  paymentDate: string;
  paymentValue: number;
  paidInMoneyCredits: number;
  paymentVAT: number;
  paymentItem: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentTransactionId: string;
  stripeToken: string;
  soldBy: string;
  saleReference: string;
  calculatedLocation: string;
  cleanedProduct: string;
  cleanedCategory: string;
  discountAmount?: number;
  grossRevenue?: number;
  preTaxMrp?: number;
  vat?: number;
  netRevenue?: number;
  postTaxMrp?: number;
  grossDiscountPercent?: number;
  netDiscountPercent?: number;
}

export interface SessionData {
  sessionId: string;
  date: string;
  time: string;
  classType: string;
  cleanedClass: string;
  instructor: string;
  location: string;
  capacity: number;
  booked: number;
  checkedIn: number;
  checkedInCount: number;
  sessionCount: number;
  fillPercentage: number;
  waitlist: number;
  noShows: number;
}

export interface NewClientData {
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  firstVisitDate: string;
  firstVisitEntityName: string;
  firstVisitType: string;
  firstVisitLocation: string;
  paymentMethod: string;
  membershipUsed: string;
  homeLocation: string;
  classNo: number;
  trainerName: string;
  isNew: string;
  visitsPostTrial: number;
  membershipsBoughtPostTrial: string;
  purchaseCountPostTrial: number;
  ltv: number;
  retentionStatus: string;
  conversionStatus: string;
  period: string;
  unique: string;
  firstPurchase: string;
  conversionSpan: number;
}

export interface PayrollData {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  location: string;
  cycleSessions: number;
  emptyCycleSessions: number;
  nonEmptyCycleSessions: number;
  cycleCustomers: number;
  cyclePaid: number;
  barreSessions: number;
  emptyBarreSessions: number;
  nonEmptyBarreSessions: number;
  barreCustomers: number;
  barrePaid: number;
  totalSessions: number;
  totalEmptySessions: number;
  totalNonEmptySessions: number;
  totalCustomers: number;
  totalPaid: number;
  monthYear: string;
  unique: string;
  new: number;
  retained: number;
  retention: string;
  converted: number;
  conversion: string;
  classAverageInclEmpty: number;
  classAverageExclEmpty: number;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface NewClientFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  homeLocation: string[];
  trainer: string[];
  paymentMethod: string[];
  retentionStatus: string[];
  conversionStatus: string[];
  isNew: string[];
  minLTV?: number;
  maxLTV?: number;
}

export interface TrainerFilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  trainer: string[];
  sessionType: string[];
}

export interface MetricCardData {
  title: string;
  value: string;
  change: number;
  description: string;
  calculation: string;
  icon: string;
  rawValue?: number;
  breakdown?: Record<string, any>;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

// Generic table data type for flexible table structures
export type TableData = Record<string, any>;

// Sales-specific metric types
export type MetricType = 'revenue' | 'transactions' | 'members' | 'atv' | 'auv' | 'asv' | 'upt';

// Trainer-specific metric types
export type TrainerMetricType = 
  | 'totalSessions' 
  | 'totalCustomers' 
  | 'totalPaid' 
  | 'classAverage' 
  | 'classAverageExclEmpty'
  | 'classAverageInclEmpty'
  | 'retention' 
  | 'conversion' 
  | 'emptySessions' 
  | 'newMembers'
  | 'cycleSessions'
  | 'barreSessions'
  | 'retainedMembers'
  | 'convertedMembers';

// Year-on-year specific metric types
export type YearOnYearMetricType = 
  | 'revenue' 
  | 'transactions' 
  | 'members' 
  | 'atv' 
  | 'auv' 
  | 'asv' 
  | 'upt'
  | 'vat'
  | 'netRevenue';

// Data table props interface
export interface DataTableProps {
  title: string;
  data: SalesData[];
  type: 'monthly' | 'product' | 'category';
  filters: FilterOptions;
  onRowClick: (row: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
}

// Enhanced Year-on-Year table props interface
export interface EnhancedYearOnYearTableProps {
  data: SalesData[];
  filters?: FilterOptions;
  onRowClick: (row: any) => void;
  collapsedGroups?: Set<string>;
  onGroupToggle?: (groupKey: string) => void;
  selectedMetric?: YearOnYearMetricType;
}

// Interactive chart props interface
export interface InteractiveChartProps {
  title: string;
  data: SalesData[] | NewClientData[] | ChartDataPoint[];
  type: 'revenue' | 'performance' | 'sessions' | 'newClients';
}
