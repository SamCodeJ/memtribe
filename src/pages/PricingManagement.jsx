import React, { useState, useEffect } from "react";
import { Feature, Package, PackageFeature, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package as PackageIcon,
  Shield
} from "lucide-react";

export default function PricingManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [features, setFeatures] = useState([]);
  const [packages, setPackages] = useState([]);
  const [packageFeatures, setPackageFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("features");
  
  // Feature form state
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    feature_key: "",
    display_name: "",
    description: "",
    feature_type: "boolean",
    default_value: "",
    category: "events",
    is_active: true
  });

  // Package form state
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    package_name: "",
    package_slug: "",
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    is_popular: false,
    display_order: 0,
    is_active: true,
    color_scheme: "blue"
  });
  const [selectedFeatures, setSelectedFeatures] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log("=== PricingManagement: Starting loadData ===");
    try {
      console.log("Fetching current user...");
      const user = await User.me();
      console.log("Current user:", user);
      setCurrentUser(user);
      
      if (user.role !== 'admin') {
        console.log("User is not admin, role:", user.role);
        setIsLoading(false);
        return;
      }

      console.log("User is admin, loading pricing data...");
      const [featuresData, packagesData, packageFeaturesData] = await Promise.all([
        Feature.list("-created_date", { includeInactive: 'true' }),
        Package.list("display_order", { includeInactive: 'true' }),
        PackageFeature.list()
      ]);

      console.log("Features loaded:", featuresData);
      console.log("Packages loaded:", packagesData);
      console.log("Package Features loaded:", packageFeaturesData);

      setFeatures(featuresData);
      setPackages(packagesData);
      setPackageFeatures(packageFeaturesData);
      console.log("=== PricingManagement: Data loaded successfully ===");
    } catch (error) {
      console.error("=== ERROR loading pricing data ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    setIsLoading(false);
    console.log("Loading complete, isLoading set to false");
  };

  const handleFeatureSubmit = async () => {
    try {
      if (editingFeature) {
        await Feature.update(editingFeature.id, featureForm);
      } else {
        await Feature.create(featureForm);
      }
      setShowFeatureDialog(false);
      setEditingFeature(null);
      setFeatureForm({
        feature_key: "",
        display_name: "",
        description: "",
        feature_type: "boolean",
        default_value: "",
        category: "events",
        is_active: true
      });
      loadData();
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("Failed to save feature");
    }
  };

  const handlePackageSubmit = async () => {
    try {
      let packageData;
      if (editingPackage) {
        await Package.update(editingPackage.id, packageForm);
        packageData = { ...editingPackage, ...packageForm };
      } else {
        packageData = await Package.create(packageForm);
      }

      // Update package features
      if (editingPackage) {
        // Remove existing package features
        const existingFeatures = packageFeatures.filter(pf => pf.package_id === editingPackage.id);
        for (const pf of existingFeatures) {
          await PackageFeature.delete(pf.id);
        }
      }

      // Add new package features
      for (const [featureId, value] of Object.entries(selectedFeatures)) {
        if (value !== undefined && value !== "" && value !== "not_included") {
          await PackageFeature.create({
            package_id: packageData.id,
            feature_id: featureId,
            feature_value: String(value),
            is_unlimited: value === "unlimited"
          });
        }
      }

      setShowPackageDialog(false);
      setEditingPackage(null);
      setPackageForm({
        package_name: "",
        package_slug: "",
        description: "",
        monthly_price: 0,
        yearly_price: 0,
        is_popular: false,
        display_order: 0,
        is_active: true,
        color_scheme: "blue"
      });
      setSelectedFeatures({});
      loadData();
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package");
    }
  };

  const editFeature = (feature) => {
    setEditingFeature(feature);
    setFeatureForm({
      feature_key: feature.feature_key || "",
      display_name: feature.display_name || feature.feature_name || "",
      description: feature.description || "",
      feature_type: feature.feature_type || "boolean",
      default_value: feature.default_value || "",
      category: feature.category || "events",
      is_active: feature.is_active !== undefined ? feature.is_active : true
    });
    setShowFeatureDialog(true);
  };

  const editPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      package_name: pkg.package_name || "",
      package_slug: pkg.package_slug || "",
      description: pkg.description || "",
      monthly_price: pkg.monthly_price || pkg.price || 0,
      yearly_price: pkg.yearly_price || 0,
      is_popular: pkg.is_popular || false,
      display_order: pkg.display_order || 0,
      is_active: pkg.is_active !== undefined ? pkg.is_active : true,
      color_scheme: pkg.color_scheme || "blue"
    });
    
    // Load package features
    const pkgFeatures = packageFeatures.filter(pf => pf.package_id === pkg.id);
    const featuresMap = {};
    pkgFeatures.forEach(pf => {
      featuresMap[pf.feature_id] = pf.is_unlimited ? "unlimited" : pf.feature_value;
    });
    setSelectedFeatures(featuresMap);
    setShowPackageDialog(true);
  };

  if (isLoading) {
    console.log("Rendering loading state...");
    return <div className="p-8">Loading pricing management...</div>;
  }

  console.log("Loading complete. Current user:", currentUser);
  console.log("Features count:", features.length);
  console.log("Packages count:", packages.length);

  if (!currentUser || currentUser.role !== 'admin') {
    console.log("Access denied - User is not admin or not logged in");
    console.log("Current user:", currentUser);
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600">You need Super Admin privileges to access pricing management.</p>
      </div>
    );
  }

  console.log("Rendering main pricing management UI...");

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Pricing Management
          </h1>
          <p className="text-slate-600">Configure features and create custom pricing packages</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="features">Feature Management</TabsTrigger>
            <TabsTrigger value="packages">Package Management</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Features</CardTitle>
                <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Feature Key</Label>
                          <Input
                            value={featureForm.feature_key}
                            onChange={(e) => setFeatureForm({...featureForm, feature_key: e.target.value})}
                            placeholder="e.g., events_per_month"
                          />
                        </div>
                        <div>
                          <Label>Display Name</Label>
                          <Input
                            value={featureForm.display_name}
                            onChange={(e) => setFeatureForm({...featureForm, display_name: e.target.value})}
                            placeholder="e.g., Events per Month"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={featureForm.description || ""}
                          onChange={(e) => setFeatureForm({...featureForm, description: e.target.value})}
                          placeholder="Describe what this feature does"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Feature Type</Label>
                          <Select
                            value={featureForm.feature_type || "boolean"}
                            onValueChange={(value) => setFeatureForm({...featureForm, feature_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="limit">Limit (Number)</SelectItem>
                              <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                              <SelectItem value="access">Access (Feature Available)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={featureForm.category || "events"}
                            onValueChange={(value) => setFeatureForm({...featureForm, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="events">Events</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="guests">Guests</SelectItem>
                              <SelectItem value="branding">Branding</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Default Value</Label>
                          <Input
                            value={featureForm.default_value || ""}
                            onChange={(e) => setFeatureForm({...featureForm, default_value: e.target.value})}
                            placeholder="e.g., 2, true, false"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={featureForm.is_active}
                          onCheckedChange={(checked) => setFeatureForm({...featureForm, is_active: checked})}
                        />
                        <Label>Feature Active</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowFeatureDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleFeatureSubmit}>
                          {editingFeature ? 'Update' : 'Create'} Feature
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="mb-2">No features available yet.</p>
                      <p className="text-sm">Click "Add Feature" to create your first feature.</p>
                    </div>
                  ) : (
                    features.map((feature) => (
                      <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{feature.display_name}</h3>
                            <Badge variant="outline">{feature.category}</Badge>
                            <Badge variant={feature.feature_type === 'limit' ? 'default' : feature.feature_type === 'boolean' ? 'secondary' : 'destructive'}>
                              {feature.feature_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                          <p className="text-xs text-slate-500 mt-1">Key: {feature.feature_key} • Default: {feature.default_value}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => editFeature(feature)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pricing Packages</CardTitle>
                <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Package
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPackage ? 'Edit Package' : 'Create New Package'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Package Name</Label>
                          <Input
                            value={packageForm.package_name}
                            onChange={(e) => setPackageForm({...packageForm, package_name: e.target.value, package_slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            placeholder="e.g., Professional"
                          />
                        </div>
                        <div>
                          <Label>Package Slug</Label>
                          <Input
                            value={packageForm.package_slug}
                            onChange={(e) => setPackageForm({...packageForm, package_slug: e.target.value})}
                            placeholder="e.g., professional"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={packageForm.description || ""}
                          onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                          placeholder="Package description"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Monthly Price ($)</Label>
                          <Input
                            type="number"
                            value={packageForm.monthly_price || 0}
                            onChange={(e) => setPackageForm({...packageForm, monthly_price: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label>Yearly Price ($)</Label>
                          <Input
                            type="number"
                            value={packageForm.yearly_price || 0}
                            onChange={(e) => setPackageForm({...packageForm, yearly_price: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label>Display Order</Label>
                          <Input
                            type="number"
                            value={packageForm.display_order || 0}
                            onChange={(e) => setPackageForm({...packageForm, display_order: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label>Color Scheme</Label>
                          <Select
                            value={packageForm.color_scheme || "blue"}
                            onValueChange={(value) => setPackageForm({...packageForm, color_scheme: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="amber">Amber</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="slate">Slate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={packageForm.is_popular}
                            onCheckedChange={(checked) => setPackageForm({...packageForm, is_popular: checked})}
                          />
                          <Label>Mark as Popular</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={packageForm.is_active}
                            onCheckedChange={(checked) => setPackageForm({...packageForm, is_active: checked})}
                          />
                          <Label>Package Active</Label>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Package Features</h3>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {features.filter(f => f.is_active).map((feature) => (
                            <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium">{feature.display_name}</h4>
                                <p className="text-sm text-slate-600">{feature.description}</p>
                              </div>
                              <div className="w-32">
                                {feature.feature_type === 'boolean' ? (
                                  <Select
                                    value={selectedFeatures[feature.id] || "not_included"}
                                    onValueChange={(value) => {
                                      const newFeatures = {...selectedFeatures};
                                      if (value === "not_included") {
                                        delete newFeatures[feature.id];
                                      } else {
                                        newFeatures[feature.id] = value;
                                      }
                                      setSelectedFeatures(newFeatures);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_included">Not Included</SelectItem>
                                      <SelectItem value="true">Yes</SelectItem>
                                      <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    type={feature.feature_type === 'limit' ? 'number' : 'text'}
                                    value={selectedFeatures[feature.id] || ""}
                                    onChange={(e) => setSelectedFeatures({...selectedFeatures, [feature.id]: e.target.value})}
                                    placeholder={feature.feature_type === 'limit' ? 'Number or "unlimited"' : 'Value'}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePackageSubmit}>
                          {editingPackage ? 'Update' : 'Create'} Package
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {packages.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      <p className="mb-2">No pricing packages available yet.</p>
                      <p className="text-sm">Click "Create Package" to create your first package.</p>
                    </div>
                  ) : (
                    packages.map((pkg) => {
                      const pkgFeatures = packageFeatures.filter(pf => pf.package_id === pkg.id);
                      return (
                        <Card key={pkg.id} className={`border-2 ${!pkg.is_active ? 'border-red-300 opacity-75' : pkg.is_popular ? 'border-amber-500' : 'border-slate-200'}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <CardTitle>{pkg.package_name}</CardTitle>
                              <div className="flex gap-2">
                                {pkg.is_popular && <Badge className="bg-amber-500">Popular</Badge>}
                                {!pkg.is_active && <Badge variant="destructive">Inactive</Badge>}
                              </div>
                            </div>
                            <p className="text-2xl font-bold">${pkg.monthly_price}/month</p>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                            <div className="space-y-2 mb-4">
                              <h4 className="font-medium">Features:</h4>
                              {pkgFeatures.map((pf) => {
                                const feature = features.find(f => f.id === pf.feature_id);
                                return feature ? (
                                  <div key={pf.id} className="text-sm flex justify-between">
                                    <span>{feature.display_name}</span>
                                    <span className="font-medium">{pf.is_unlimited ? 'Unlimited' : pf.feature_value}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => editPackage(pkg)} className="w-full">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Package
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}