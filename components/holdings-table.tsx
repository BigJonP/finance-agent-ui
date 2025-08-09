'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { holdingsApi, type Holding } from '@/lib/api'

interface HoldingsTableProps {
  userId: string
}

export function HoldingsTable({ userId }: HoldingsTableProps) {
  const queryClient = useQueryClient()

  const {
    data: holdings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['holdings', userId],
    queryFn: () => holdingsApi.getAll(userId),
    enabled: !!userId,
  })

  const deleteMutation = useMutation({
    mutationFn: (data: { user_id: string; stock: string }) =>
      holdingsApi.delete(data),
    onMutate: async (deleteData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['holdings', userId] })
      
      // Snapshot the previous value
      const previousHoldings = queryClient.getQueryData(['holdings', userId])
      
      // Optimistically update to remove the holding
      queryClient.setQueryData(['holdings', userId], (old: any) => {
        return old?.filter((holding: any) => holding.stock !== deleteData.stock) || []
      })
      
      console.log('Optimistically removed holding:', deleteData.stock)
      return { previousHoldings }
    },
    onSuccess: (response) => {
      console.log('Delete successful:', response)
      // Refetch to get the latest data from server
      queryClient.invalidateQueries({ queryKey: ['holdings', userId] })
    },
    onError: (error, deleteData, context) => {
      console.error('Delete failed:', error)
      // Rollback on error
      if (context?.previousHoldings) {
        queryClient.setQueryData(['holdings', userId], context.previousHoldings)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['holdings', userId] })
    },
  })

  const handleDelete = (stock: string) => {
    deleteMutation.mutate({ user_id: userId, stock })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading holdings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load holdings: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No holdings found. Add your first holding using the form above.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Holdings</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stock Ticker</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => (
            <TableRow key={`${holding.stock}-${holding.user_id}`}>
              <TableCell className="font-medium">{holding.stock}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(holding.stock)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending &&
                  deleteMutation.variables?.stock === holding.stock ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
