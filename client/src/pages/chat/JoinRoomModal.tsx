import { useState } from 'react'
import { Modal } from '@core/organisms/Modal'
import { Input } from '@core/primitives/Input'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { useNavigate } from 'react-router-dom'
import { useJoinRoom } from '@hooks/useRooms'
import { ApiError } from '@services/api'
import { Link2 } from 'lucide-react'

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinRoomModal({ open, onOpenChange }: JoinRoomModalProps) {
  const [roomId, setRoomId] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const joinRoom = useJoinRoom()

  function handleClose() {
    setRoomId('')
    setInviteCode('')
    setError(null)
    onOpenChange(false)
  }

  async function handleJoin() {
    if (!roomId.trim()) {
      setError('Informe o ID da sala')
      return
    }

    try {
      setError(null)
      const member = await joinRoom.mutateAsync({
        roomId: roomId.trim(),
        inviteCode: inviteCode.trim() || undefined,
      })
      navigate(`/chat/${member.roomId}`)
      handleClose()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao entrar na sala')
      }
    }
  }

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <Modal.Content size="sm">
        <Modal.Header>
          <Modal.Title>Entrar em uma sala</Modal.Title>
          <Modal.Description>
            Insira o ID da sala e o código de convite (se for privada)
          </Modal.Description>
        </Modal.Header>

        <Modal.Body className="space-y-4">
          {error && (
            <div className="border-error-base/20 bg-error-base/5 text-error-base rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              ID da sala <span className="text-error-base">*</span>
            </label>
            <Input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Cole o ID da sala aqui"
              leftIcon={<Link2 className="h-4 w-4" />}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Código de convite <span className="text-[var(--text-muted)]">(opcional)</span>
            </label>
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Ex: 3db79d8e"
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              Cancelar
            </button>
          </Modal.Close>
          <Button variant="primary" size="md" onClick={handleJoin} disabled={joinRoom.isPending}>
            {joinRoom.isPending ? (
              <>
                <Spinner size="xs" variant="white" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
}
