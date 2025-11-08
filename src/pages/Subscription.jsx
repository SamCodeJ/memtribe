import React, { useState, useEffect } from "react";
import { Package, PackageFeature, Feature, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Crown, Building, Badge, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Subscription() {
  const [packages, setPackages] = useState([]);
  const [packageFeatures, setPackageFeatures] = useState([]);
  const [features, setFeatures] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesData, packageFeaturesData, featuresData, userData] = await Promise.all([
          Package.list("display_order"),
          PackageFeature.list(),
          Feature.list(),
          User.me()
        ]);
        setPackages(packagesData);
        setPackageFeatures(packageFeaturesData);
        setFeatures(featuresData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!currentUser || currentUser.subscription_plan === plan) return;
    
    console.log('🔄 Attempting to upgrade plan to:', plan);
    console.log('🔄 Current user:', currentUser);
    
    try {
      const updatedUser = await User.updateMyUserData({ subscription_plan: plan });
      console.log('✅ Plan update successful:', updatedUser);
      
      setCurrentUser(prev => ({...prev, subscription_plan: plan}));
      alert(`You have successfully upgraded to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
      
      // Verify the update
      const verifyUser = await User.me();
      console.log('✅ Verified plan in database:', verifyUser.subscription_plan);
      
      if (verifyUser.subscription_plan !== plan) {
        console.warn('⚠️ Warning: Database shows different plan:', verifyUser.subscription_plan);
      }
    } catch (error) {
      console.error("❌ Error upgrading plan:", error);
      alert(`Failed to upgrade plan: ${error.message}\n\nPlease try again or contact support.`);
    }
  };

  const getPackageFeatures = (packageId) => {
    return packageFeatures.filter(pf => pf.package_id === packageId);
  };

  const getFeatureName = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    return feature ? feature.display_name : 'Unknown Feature';
  };

  const getColorClasses = (colorScheme) => {
    const colors = {
      blue: "border-blue-500 bg-blue-50",
      amber: "border-amber-500 bg-amber-50",
      purple: "border-purple-500 bg-purple-50",
      green: "border-green-500 bg-green-50",
      slate: "border-slate-500 bg-slate-50"
    };
    return colors[colorScheme] || colors.blue;
  };

  if (isLoading || !currentUser) {
    return (
        <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-slate-600">Unlock more features and create unlimited events.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
          {packages.map(pkg => {
            const pkgFeatures = getPackageFeatures(pkg.id);
            const isCurrentPlan = currentUser.subscription_plan === pkg.package_slug;
            
            return (
              <Card 
                key={pkg.id} 
                className={`relative flex flex-col shadow-lg border-2 ${
                  pkg.is_popular ? 'scale-105 ' + getColorClasses(pkg.color_scheme) : 'bg-white border-slate-200'
                }`}
              >
                {pkg.is_popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{pkg.package_name}</CardTitle>
                  <p className="text-sm text-slate-500 h-10">{pkg.description}</p>
                  <p className="text-4xl font-extrabold text-slate-900">
                    ${pkg.monthly_price}
                    <span className="text-lg font-medium text-slate-500">/mo</span>
                  </p>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-slate-700">
                    {pkgFeatures.map(pf => (
                      <li key={pf.id} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                        <span>
                          {getFeatureName(pf.feature_id)}: {pf.is_unlimited ? 'Unlimited' : pf.feature_value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectPlan(pkg.package_slug)}
                    disabled={isCurrentPlan}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-green-600 hover:bg-green-600' 
                        : 'bg-amber-600 hover:bg-amber-700'
                    } disabled:opacity-100`}
                  >
                    {isCurrentPlan ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>This is a simulation. No real payment will be processed. Upgrading will update your account status within the app.</p>
        </div>
      </div>
    </div>
  );
}