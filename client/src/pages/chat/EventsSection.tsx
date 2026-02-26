import { memo, useState } from 'react'
import { Badge } from '@core/primitives/Badge'
import { Button } from '@core/primitives/Button'
import { Spinner } from '@core/primitives/Spinner'
import { Avatar } from '@core/primitives/Avatar'
import { useRoomEvents, useCancelEvent, useRespondInvite } from '@hooks/useEvents'
import { useAuthStore } from '@store/auth.store'
import { Calendar, Plus, Clock, Check, X, Users, Trash2 } from 'lucide-react'
import { CreateEventModal } from './CreateEventModal'
import type { EventPayload } from '@/types/event'

interface EventsSectionProps {
  roomId: string
  canManage: boolean
}

export const EventsSection = memo(function EventsSection({
  roomId,
  canManage,
}: EventsSectionProps) {
  const { data: events, isLoading } = useRoomEvents(roomId)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          Eventos
        </h4>
        {canManage && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            aria-label="Criar evento"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && (!events || events.length === 0) && (
        <div className="rounded-lg border border-dashed border-[var(--border-default)] px-3 py-4 text-center">
          <Calendar className="mx-auto mb-1.5 h-5 w-5 text-[var(--text-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">Nenhum evento agendado</p>
          {canManage && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1.5 text-xs font-medium text-[var(--primary-base)] transition-colors hover:text-[var(--primary-hover)]"
            >
              Criar primeiro evento
            </button>
          )}
        </div>
      )}

      {events && events.length > 0 && (
        <div className="space-y-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} roomId={roomId} canManage={canManage} />
          ))}
        </div>
      )}

      <CreateEventModal roomId={roomId} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
})

// ============ EVENT CARD ============

interface EventCardProps {
  event: EventPayload
  roomId: string
  canManage: boolean
}

function EventCard({ event, roomId, canManage }: EventCardProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const cancelEvent = useCancelEvent(roomId)
  const respondInvite = useRespondInvite(roomId)

  const myInvite = event.invites.find((i) => i.userId === userId)
  const acceptedCount = event.invites.filter((i) => i.status === 'ACCEPTED').length
  const totalInvites = event.invites.length
  const isCreator = event.createdBy === userId

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const isToday = new Date().toDateString() === startDate.toDateString()
  const isPast = endDate < new Date()

  function handleCancel() {
    if (!window.confirm('Cancelar este evento?')) return
    cancelEvent.mutate(event.id)
  }

  function handleRsvp(status: 'ACCEPTED' | 'DECLINED') {
    respondInvite.mutate({ eventId: event.id, status })
  }

  return (
    <div
      className={`group rounded-lg border p-3 transition-colors duration-150 ${
        isPast
          ? 'border-[var(--border-default)] bg-[var(--bg-subtle)] opacity-60'
          : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]'
      }`}
    >
      {/* Header: title + status */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h5 className="text-sm leading-tight font-medium text-[var(--text-primary)]">
          {event.title}
        </h5>
        <div className="flex shrink-0 items-center gap-1">
          {isToday && !isPast && (
            <Badge variant="success" size="sm">
              Hoje
            </Badge>
          )}
          {isPast && (
            <Badge variant="default" size="sm">
              Encerrado
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
          {event.description}
        </p>
      )}

      {/* Date/time */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <Clock className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
        <span>{formatEventTime(startDate, endDate)}</span>
      </div>

      {/* Invite stats */}
      {totalInvites > 0 && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Users className="h-3 w-3 shrink-0" />
          <span>
            {acceptedCount} confirmado{acceptedCount !== 1 ? 's' : ''} / {totalInvites} convidado
            {totalInvites !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Accepted avatars (max 5) */}
      {acceptedCount > 0 && (
        <div className="mb-2 flex items-center -space-x-1">
          {event.invites
            .filter((i) => i.status === 'ACCEPTED')
            .slice(0, 5)
            .map((invite) => (
              <Avatar
                key={invite.id}
                fallback={invite.user.name.slice(0, 2).toUpperCase()}
                src={invite.user.avatar ?? undefined}
                size="xs"
                className="ring-2 ring-[var(--bg-base)]"
              />
            ))}
          {acceptedCount > 5 && (
            <span className="ml-1.5 text-[10px] text-[var(--text-muted)]">
              +{acceptedCount - 5}
            </span>
          )}
        </div>
      )}

      {/* Creator */}
      <div className="mb-2 text-[10px] text-[var(--text-muted)]">
        Criado por {isCreator ? 'você' : event.creator.name}
      </div>

      {/* Actions */}
      {!isPast && (
        <div className="flex items-center gap-1.5">
          {/* RSVP buttons for invited users */}
          {myInvite && myInvite.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleRsvp('ACCEPTED')}
                disabled={respondInvite.isPending}
                className="gap-1 text-[var(--success-base)]"
              >
                <Check className="h-3 w-3" />
                Aceitar
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleRsvp('DECLINED')}
                disabled={respondInvite.isPending}
                className="gap-1 text-[var(--text-muted)]"
              >
                <X className="h-3 w-3" />
                Recusar
              </Button>
            </>
          )}

          {myInvite && myInvite.status === 'ACCEPTED' && (
            <Badge variant="success" size="sm" className="gap-1">
              <Check className="h-2.5 w-2.5" />
              Confirmado
            </Badge>
          )}

          {myInvite && myInvite.status === 'DECLINED' && (
            <Badge variant="default" size="sm" className="gap-1">
              <X className="h-2.5 w-2.5" />
              Recusado
            </Badge>
          )}

          {/* Cancel button for admin/owner/creator */}
          {(canManage || isCreator) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelEvent.isPending}
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--bg-emphasis)] hover:text-[var(--error-base)] disabled:opacity-50"
              aria-label="Cancelar evento"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============ HELPERS ============

function formatEventTime(start: Date, end: Date): string {
  const dateOpts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
  }
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  const sameDay = start.toDateString() === end.toDateString()
  const startDate = start.toLocaleDateString('pt-BR', dateOpts)
  const startTime = start.toLocaleTimeString('pt-BR', timeOpts)
  const endTime = end.toLocaleTimeString('pt-BR', timeOpts)

  if (sameDay) {
    return `${startDate} \u00B7 ${startTime} \u2013 ${endTime}`
  }

  const endDate = end.toLocaleDateString('pt-BR', dateOpts)
  return `${startDate} ${startTime} \u2013 ${endDate} ${endTime}`
}
