import React, { useEffect, useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface OnboardingProps {
  userId: string;
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to Airflow',
    body: 'Plan projects, manage tasks, and collaborate with your team in one place.'
  },
  {
    title: 'Projects & Teams',
    body: 'Create projects, add documents, and manage team members with staffing controls.'
  },
  {
    title: 'Tasks & Dependencies',
    body: 'Break work into tasks and checklist items. Add dependencies to visualize and unblock work.'
  },
  {
    title: 'Dashboards & Search',
    body: 'Track progress on the dashboard and quickly find anything with global search.'
  }
];

export function Onboarding({ userId, onClose }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const storageKey = `airflow_onboarding_completed_${userId}`;

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === '1') {
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeAndClose = () => {
    localStorage.setItem(storageKey, '1');
    onClose();
  };

  const skip = () => {
    // Mark as completed so it won’t re-open
    localStorage.setItem(storageKey, '1');
    onClose();
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{steps[index].title}</h2>
              <p className="text-sm text-gray-600 mt-1">{steps[index].body}</p>
            </div>
            <Button variant="outline" size="sm" onClick={skip} title="Skip onboarding">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center space-x-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === index ? 'bg-red-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {index < steps.length - 1 ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={skip}>Skip</Button>
                <Button size="sm" onClick={() => setIndex(Math.min(steps.length - 1, index + 1))}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={completeAndClose}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Get Started
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
