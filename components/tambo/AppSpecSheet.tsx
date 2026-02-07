'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export interface AppSpecSheetProps {
  features?: string;
  designSystem?: 'tailwind' | 'material' | 'chakra' | 'custom';
  complexity?: 'simple' | 'moderate' | 'complex';
  onSubmit: (data: {
    features: string;
    designSystem: 'tailwind' | 'material' | 'chakra' | 'custom';
    complexity: 'simple' | 'moderate' | 'complex';
  }) => void;
}

export const AppSpecSheet = ({
  features = '',
  designSystem = 'tailwind',
  complexity = 'simple',
  onSubmit,
}: AppSpecSheetProps) => {
  const [formData, setFormData] = useState({
    features,
    designSystem,
    complexity,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl border border-zinc-200">
      <h2 className="text-2xl font-bold mb-2 text-zinc-900">
        Let&apos;s Build Your App
      </h2>
      <p className="text-sm text-zinc-600 mb-6">
        Tell us what you want to create, and we&apos;ll generate it for you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Features Input */}
        <div className="space-y-2">
          <Label htmlFor="features" className="text-zinc-900">
            What features do you need?
          </Label>
          <Textarea
            id="features"
            placeholder="e.g., User authentication, Dashboard, Data visualization, Shopping cart..."
            value={formData.features}
            onChange={(e) =>
              setFormData({
                ...formData,
                features: e.target.value,
              })
            }
            className="min-h-[120px]"
            required
          />
          <p className="text-xs text-zinc-500">
            Describe the main features and functionality you want in your app.
          </p>
        </div>

        {/* Design System Select */}
        <div className="space-y-2">
          <Label htmlFor="designSystem" className="text-zinc-900">
            Design System
          </Label>
          <Select
            id="designSystem"
            value={formData.designSystem}
            onChange={(e) =>
              setFormData({
                ...formData,
                designSystem: e.target.value as typeof formData.designSystem,
              })
            }
          >
            <option value="tailwind">Tailwind CSS</option>
            <option value="material">Material UI</option>
            <option value="chakra">Chakra UI</option>
            <option value="custom">Custom Styling</option>
          </Select>
          <p className="text-xs text-zinc-500">
            Choose the styling framework for your app.
          </p>
        </div>

        {/* Complexity Radio Buttons */}
        <div className="space-y-2">
          <Label className="text-zinc-900">Complexity Level</Label>
          <div className="flex gap-3 flex-wrap">
            {(['simple', 'moderate', 'complex'] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                  formData.complexity === level
                    ? 'bg-purple-500 text-white [box-shadow:inset_0px_-2px_0px_0px_#5b21b6,_0px_1px_6px_0px_rgba(139,_92,_246,_58%)]'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 [box-shadow:inset_0px_-2px_0px_0px_#d4d4d8,_0px_1px_6px_0px_rgba(161,_161,_170,_30%)]'
                }`}
                onClick={() =>
                  setFormData({ ...formData, complexity: level })
                }
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Simple: Basic functionality • Moderate: Multiple features • Complex:
            Advanced architecture
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="purple"
          size="lg"
          className="w-full"
          disabled={!formData.features.trim()}
        >
          Generate App
        </Button>
      </form>
    </div>
  );
};

export default AppSpecSheet;
