/**
 * Example usage of AppSpecSheet component
 * 
 * This file demonstrates how to use the AppSpecSheet component
 * for collecting application requirements from users.
 */

import { AppSpecSheet } from './AppSpecSheet';

export default function AppSpecSheetExample() {
  const handleSubmit = (data: {
    features: string;
    designSystem: 'tailwind' | 'material' | 'chakra' | 'custom';
    complexity: 'simple' | 'moderate' | 'complex';
  }) => {
    console.log('Form submitted with data:', data);
    alert(`App Spec Submitted!\n\nFeatures: ${data.features}\nDesign System: ${data.designSystem}\nComplexity: ${data.complexity}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 mb-2">
            AppSpecSheet Component Example
          </h1>
          <p className="text-zinc-600">
            Adaptive requirement gathering for novice users
          </p>
        </div>

        {/* Example 1: Default State */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">
            Example 1: Default State
          </h2>
          <AppSpecSheet onSubmit={handleSubmit} />
        </div>

        {/* Example 2: Pre-filled State */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">
            Example 2: Pre-filled State
          </h2>
          <AppSpecSheet
            features="User authentication with OAuth, Dashboard with analytics, Real-time notifications"
            designSystem="material"
            complexity="moderate"
            onSubmit={handleSubmit}
          />
        </div>

        {/* Example 3: Complex Project */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">
            Example 3: Complex Project
          </h2>
          <AppSpecSheet
            features={`E-commerce platform with:
- Product catalog with search and filters
- Shopping cart and checkout
- Payment integration (Stripe)
- Order management
- Admin dashboard
- Email notifications`}
            designSystem="chakra"
            complexity="complex"
            onSubmit={handleSubmit}
          />
        </div>

        {/* Usage Notes */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md border border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900 mb-3">
            Usage Notes
          </h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>
              <strong>Features:</strong> Textarea for describing app functionality
            </li>
            <li>
              <strong>Design System:</strong> Select dropdown with options: Tailwind CSS, Material UI, Chakra UI, Custom
            </li>
            <li>
              <strong>Complexity:</strong> Radio buttons for Simple, Moderate, or Complex
            </li>
            <li>
              <strong>Submit:</strong> Disabled when features field is empty
            </li>
            <li>
              <strong>Adaptive UI:</strong> Tambo Agent renders this for novice users, skips for experts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
