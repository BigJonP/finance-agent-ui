'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { adviceApi, type AdviceResponse } from '@/lib/api'

interface AdviceCardProps {
  userId: string
}

export function AdviceCard({ userId }: AdviceCardProps) {
  const [advice, setAdvice] = useState<AdviceResponse | null>(null)

  const mutation = useMutation({
    mutationFn: adviceApi.generate,
    onSuccess: (data) => {
      setAdvice(data)
    },
  })

  const handleGenerateAdvice = () => {
    mutation.mutate({ user_id: userId })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Financial Advice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerateAdvice}
          disabled={mutation.isPending}
          className="w-full md:w-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {advice ? 'Generate New Advice' : 'Generate Advice'}
            </>
          )}
        </Button>

        {mutation.error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to generate advice: {mutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {advice && (
          <div className="space-y-2">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {advice.advice}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Generated on{' '}
              {new Date(advice.generated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {!advice && !mutation.isPending && (
          <p className="text-muted-foreground text-sm">
            Click the button above to get personalized financial advice based on your current holdings.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
