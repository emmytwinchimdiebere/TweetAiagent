"use client"

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/hooks/use-toast"
import { Bird } from 'lucide-react';
export default function SubmitDataPage() {
  const [inputData, setInputData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit data')
      }

      toast({
        title: "Success",
        description: "Your data has been submitted successfully.",
      })

      // Optionally, redirect to another page or clear the form
      setInputData('')
      // router.push('/thank-you') // Uncomment this line if you want to redirect after submission
    } catch (error) {
      console.error('Error submitting data:', error)
      toast({
        title: "Error",
        description: "Failed to submit data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <h1 className="flex  flex-row gap-3text-2xl font-bold mb-6">Tweet <Bird/></h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="data" className="block text-sm font-medium mb-1">
            Enter your data
          </label>
          <Input
            id="data"
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Enter your tweet here"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}