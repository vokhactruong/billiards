import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTables, useTransferTable } from '@/hooks/useTables'
import { ArrowRightLeft } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  fromTableId: number
}

export function TransferDialog({ open, onClose, fromTableId }: Props) {
  const { data: tables } = useTables()
  const transfer = useTransferTable()

  const available = tables?.filter((t) => t.status === 'AVAILABLE' && t.id !== fromTableId)

  const handleTransfer = async (toId: number) => {
    await transfer.mutateAsync({ fromId: fromTableId, toId })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Chuyển bàn
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {available?.length === 0 && (
            <p className="col-span-2 text-center text-muted-foreground text-sm py-4">
              Không có bàn trống
            </p>
          )}
          {available?.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              onClick={() => handleTransfer(t.id)}
              disabled={transfer.isPending}
              className="h-16 flex-col gap-1"
            >
              <span className="font-bold">{t.name}</span>
              <span className="text-xs text-muted-foreground">Trống</span>
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={onClose}>Hủy</Button>
      </DialogContent>
    </Dialog>
  )
}
