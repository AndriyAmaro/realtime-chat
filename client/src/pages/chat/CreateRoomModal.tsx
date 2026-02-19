import { z } from 'zod'
import { Modal } from '@core/organisms/Modal'
import {
  Form,
  ControlledField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  SubmitButton,
  useFormWithSchema,
} from '@core/organisms/Form'
import { Input } from '@core/primitives/Input'
import { Switch } from '@core/primitives/Switch'
import { useCreateRoom } from '@hooks/useRooms'
import { useRoomStore } from '@store/room.store'
import { Hash, Lock } from 'lucide-react'

const createRoomSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  isPrivate: z.boolean().default(false),
})

type CreateRoomValues = z.infer<typeof createRoomSchema>

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
  const createRoom = useCreateRoom()
  const selectRoom = useRoomStore((s) => s.selectRoom)

  const form = useFormWithSchema({
    schema: createRoomSchema,
    defaultValues: { name: '', description: '', isPrivate: false },
  })

  async function onSubmit(values: CreateRoomValues) {
    const room = await createRoom.mutateAsync({
      name: values.name,
      description: values.description || undefined,
      isPrivate: values.isPrivate,
    })
    selectRoom(room.id)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="sm">
          <Modal.Header>
            <Modal.Title>Criar nova sala</Modal.Title>
            <Modal.Description>Crie uma sala para conversar com outras pessoas</Modal.Description>
          </Modal.Header>

          <Form form={form} onSubmit={onSubmit} className="space-y-5">
            <Modal.Body className="space-y-4">
              <ControlledField name="name" control={form.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel required>Nome da sala</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Dev Frontend"
                        leftIcon={
                          form.watch('isPrivate') ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Hash className="h-4 w-4" />
                          )
                        }
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>

              <ControlledField name="description" control={form.control}>
                {({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sobre o que é essa sala?" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              </ControlledField>

              <ControlledField name="isPrivate" control={form.control}>
                {({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Sala privada</FormLabel>
                        <p className="text-xs text-[var(--text-muted)]">
                          Apenas quem tiver o código de convite poderá entrar
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              </ControlledField>
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
              <SubmitButton
                variant="primary"
                size="md"
                isSubmitting={form.formState.isSubmitting}
                loadingText="Criando..."
              >
                Criar sala
              </SubmitButton>
            </Modal.Footer>
          </Form>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
