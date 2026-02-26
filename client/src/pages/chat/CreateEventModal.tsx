import { useState } from 'react'
import { Modal } from '@core/organisms/Modal'
import { Button } from '@core/primitives/Button'
import { Input } from '@core/primitives/Input'
import { Textarea } from '@core/primitives/Textarea'
import { FormField } from '@core/patterns/FormField'
import { Spinner } from '@core/primitives/Spinner'
import { useCreateEvent } from '@hooks/useEvents'
import { CalendarPlus } from 'lucide-react'

interface CreateEventModalProps {
  roomId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEventModal({ roomId, open, onOpenChange }: CreateEventModalProps) {
  const createEvent = useCreateEvent(roomId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function resetForm() {
    setTitle('')
    setDescription('')
    setStartTime('')
    setEndTime('')
    setErrors({})
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    if (!startTime) {
      newErrors.startTime = 'Data de início é obrigatória'
    }
    if (!endTime) {
      newErrors.endTime = 'Data de término é obrigatória'
    }
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      newErrors.endTime = 'Término deve ser após o início'
    }
    if (startTime && new Date(startTime) < new Date()) {
      newErrors.startTime = 'Início deve ser no futuro'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    createEvent.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      },
      {
        onSuccess: () => {
          resetForm()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header>
          <Modal.Title className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-[var(--primary-base)]" />
            Criar evento
          </Modal.Title>
          <Modal.Description>Agende um evento para os membros da sala.</Modal.Description>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body className="space-y-4">
            <FormField label="Título" required error={errors.title}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião semanal"
                state={errors.title ? 'error' : 'default'}
                inputSize="md"
              />
            </FormField>

            <FormField label="Descrição">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do evento (opcional)"
                resize="none"
                className="min-h-[60px]"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Início" required error={errors.startTime}>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  state={errors.startTime ? 'error' : 'default'}
                  inputSize="md"
                />
              </FormField>

              <FormField label="Término" required error={errors.endTime}>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  state={errors.endTime ? 'error' : 'default'}
                  inputSize="md"
                />
              </FormField>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={createEvent.isPending}>
              {createEvent.isPending ? (
                <>
                  <Spinner size="sm" />
                  Criando...
                </>
              ) : (
                'Criar evento'
              )}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal>
  )
}
