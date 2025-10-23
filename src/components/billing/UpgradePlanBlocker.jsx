import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UpgradePlanBlocker({ title, message }) {
  return (
    <Card className="border-0 shadow-lg bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Lock className="w-5 h-5" />
          {title || "Feature Locked"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-amber-800 mb-6">
          {message || "You have reached the limit for your current plan."}
        </p>
        <Link to={createPageUrl("Subscription")}>
          <Button className="bg-amber-600 hover:bg-amber-700">
            Upgrade Your Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}