"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import React from 'react'

const Onboarding = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Add your form submission logic here
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="max-w-md border-0 shadow-xl bg-white rounded-2xl p-6">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-indigo-500">
            Welcome to HireGrid
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Let's get started with setting up your account
          </CardDescription>
        </CardHeader>
        <CardContent className='max-w'>
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-2">
              <label htmlFor="organizationName" className="text-sm font-medium text-gray-600">
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                placeholder="Your Organization Name"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/10 max-w"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-600">
                Address
              </label>
              <input
                id="address"
                type="text"
                placeholder="Your Organization Address (e.g. 123 Main St, Anytown, USA)"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/10"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
              Next
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;