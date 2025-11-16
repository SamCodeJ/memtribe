import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Crown, 
  Zap, 
  Building2, 
  Sparkles,
  Search,
  RefreshCw,
  Edit,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PLAN_ICONS = {
  starter: Sparkles,
  pro: Zap,
  business: Building2,
  enterprise: Crown
};

const PLAN_COLORS = {
  starter: 'bg-gray-100 text-gray-800 border-gray-300',
  pro: 'bg-blue-100 text-blue-800 border-blue-300',
  business: 'bg-purple-100 text-purple-800 border-purple-300',
  enterprise: 'bg-amber-100 text-amber-800 border-amber-300'
};

export default function UserSubscriptions() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newPlan, setNewPlan] = useState('');
  const { toast } = useToast();

  const limit = 50;

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filterPlan, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const params = new URLSearchParams({
        limit,
        offset: (page - 1) * limit
      });
      
      if (filterPlan !== 'all') {
        params.append('subscription_plan', filterPlan);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${API_URL}/api/admin/users/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/subscriptions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser || !newPlan) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription_plan: newPlan })
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      const data = await response.json();
      toast({
        title: 'Success',
        description: data.message
      });
      
      setShowEditDialog(false);
      setSelectedUser(null);
      setNewPlan('');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setNewPlan(user.subscription_plan);
    setShowEditDialog(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Subscriptions</h1>
          <p className="text-muted-foreground">Manage user subscription plans</p>
        </div>
        <Button onClick={() => { fetchUsers(); fetchStats(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_events} events created
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-600" />
                Starter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_plan.starter}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.by_plan.starter / stats.total_users) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_plan.pro}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.by_plan.pro / stats.total_users) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_plan.business}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.by_plan.business / stats.total_users) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                Enterprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_plan.enterprise}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.by_plan.enterprise / stats.total_users) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <Select value={filterPlan} onValueChange={(value) => {
              setFilterPlan(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>
            Showing {users.length} of {total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const PlanIcon = PLAN_ICONS[user.subscription_plan];
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={PLAN_COLORS[user.subscription_plan]}>
                              <PlanIcon className="h-3 w-3 mr-1" />
                              {user.subscription_plan}
                            </Badge>
                          </TableCell>
                          <TableCell>{user._count.events}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit Plan
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Plan</label>
              <p className="text-sm text-muted-foreground">
                {selectedUser?.subscription_plan}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Plan</label>
              <Select value={newPlan} onValueChange={setNewPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription}>
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

