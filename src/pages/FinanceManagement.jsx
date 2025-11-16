import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  RefreshCw,
  Download,
  CreditCard,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function FinanceManagement() {
  const [financialStats, setFinancialStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    fetchFinancialData();
  }, [selectedYear, selectedMonth]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Fetch financial statistics
      const statsResponse = await fetch(`${API_URL}/api/admin/finance/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) throw new Error('Failed to fetch financial statistics');
      const statsData = await statsResponse.json();
      setFinancialStats(statsData);

      // Fetch monthly revenue
      const revenueResponse = await fetch(
        `${API_URL}/api/admin/finance/monthly-revenue?year=${selectedYear}&month=${selectedMonth}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!revenueResponse.ok) throw new Error('Failed to fetch monthly revenue');
      const revenueData = await revenueResponse.json();
      setMonthlyRevenue(revenueData);

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!monthlyRevenue) return;

    const csvData = [
      ['Month', 'Year', 'User', 'Email', 'Plan', 'Status', 'Last Payment'],
      ...monthlyRevenue.active_users.map(user => [
        monthlyRevenue.month_name,
        monthlyRevenue.year,
        user.full_name,
        user.email,
        user.subscription_plan,
        user.subscription_status,
        user.last_payment_date ? format(new Date(user.last_payment_date), 'yyyy-MM-dd') : 'N/A'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${monthlyRevenue.year}-${monthlyRevenue.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Revenue report exported to CSV'
    });
  };

  if (loading && !financialStats) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Monitor revenue and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFinancialData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {monthlyRevenue && (
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {financialStats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Monthly Revenue (MRR)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialStats.current_mrr)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current recurring revenue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      Annual Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(financialStats.annual_projection)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      MRR × 12 months
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Active Subscriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {financialStats.total_active_subscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paying customers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      Average Revenue Per User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatCurrency(
                        financialStats.total_active_subscriptions > 0
                          ? financialStats.current_mrr / financialStats.total_active_subscriptions
                          : 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ARPU per month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Subscription Plan</CardTitle>
                  <CardDescription>Breakdown of revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(financialStats.plan_breakdown).map(([plan, data]) => (
                      <div key={plan} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize">{plan}</span>
                            <Badge variant="outline">{data.count} subscribers</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(data.revenue / financialStats.current_mrr) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(data.revenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((data.revenue / financialStats.current_mrr) * 100).toFixed(1)}% of MRR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Plan Pricing Reference */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans & Pricing</CardTitle>
                  <CardDescription>Current pricing structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {financialStats.packages.map((pkg) => (
                      <div key={pkg.slug} className="p-4 border rounded-lg">
                        <h3 className="font-semibold capitalize mb-2">{pkg.name}</h3>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(pkg.monthly_price)}
                        </div>
                        <p className="text-xs text-muted-foreground">per month</p>
                        {pkg.yearly_price > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {formatCurrency(pkg.yearly_price)}/year
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Monthly Report Tab */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Month Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Select Month:</span>
                </div>
                
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {monthlyRevenue && (
            <>
              {/* Monthly Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(monthlyRevenue.total_revenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      For {monthlyRevenue.month_name} {monthlyRevenue.year}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {monthlyRevenue.total_active_subscriptions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paying customers this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average per Subscriber</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(
                        monthlyRevenue.total_active_subscriptions > 0
                          ? monthlyRevenue.total_revenue / monthlyRevenue.total_active_subscriptions
                          : 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average revenue per user
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Plan - Monthly */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown by Plan</CardTitle>
                  <CardDescription>
                    {monthlyRevenue.month_name} {monthlyRevenue.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(monthlyRevenue.revenue_by_plan).map(([plan, data]) => (
                      <div key={plan} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium capitalize">{plan}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({data.users} {data.users === 1 ? 'user' : 'users'} × {formatCurrency(data.price)})
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(data.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Subscribers Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Subscribers</CardTitle>
                  <CardDescription>
                    All users with active subscriptions in {monthlyRevenue.month_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Payment</TableHead>
                          <TableHead className="text-right">Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monthlyRevenue.active_users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.subscription_plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.subscription_status === 'active' ? 'success' : 'secondary'}
                                className="capitalize"
                              >
                                {user.subscription_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.last_payment_date 
                                ? format(new Date(user.last_payment_date), 'MMM dd, yyyy')
                                : 'N/A'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              {format(new Date(user.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {financialStats && (
            <Card>
              <CardHeader>
                <CardTitle>6-Month Revenue Trend</CardTitle>
                <CardDescription>Historical revenue and subscriber growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialStats.monthly_trend.map((month) => (
                    <div key={`${month.year}-${month.month}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {month.month_name} {month.year}
                          </span>
                          <Badge variant="outline">
                            {month.active_users} active users
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(month.estimated_revenue / financialStats.current_mrr) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(month.estimated_revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

