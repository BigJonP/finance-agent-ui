'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { holdingsApi } from '@/lib/api'

interface AddHoldingFormProps {
  userId: string
}

export function AddHoldingForm({ userId }: AddHoldingFormProps) {
  const [stock, setStock] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: holdingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holdings', userId] })
      setStock('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stock.trim()) return

    mutation.mutate({
      user_id: userId,
      stock: stock.trim().toUpperCase(),
      quantity: 1, // Default quantity to 1
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Holding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Ticker</Label>
            <Input
              id="stock"
              placeholder="e.g., AAPL"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={mutation.isPending}
              className="uppercase"
            />
          </div>

          {mutation.error && (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to add holding: {mutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              !stock.trim()
            }
            className="w-full md:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Holding
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
