import { sqliteTable, text, integer, real, blob, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// ─── Snacks ───────────────────────────────────────────────────────────────────

export const snacks = sqliteTable('snacks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  pricePerUnit: real('price_per_unit'),
  internalDescription: text('internal_description'),
})

// ─── Participants ─────────────────────────────────────────────────────────────

export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  snackPreference: text('snack_preference'),
  embeddings: blob('embeddings'),
})

// ─── Events ───────────────────────────────────────────────────────────────────

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  date: text('date').notNull(), // ISO 8601 e.g. "2026-06-15"
  description: text('description'),
})

// ─── Join table: event <-> participant ────────────────────────────────────────

export const eventParticipants = sqliteTable(
  'event_participants',
  {
    eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    participantId: text('participant_id').notNull().references(() => participants.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.participantId] })]
)

// ─── Relations (for Drizzle's relational query API) ───────────────────────────

export const snacksRelations = relations(snacks, ({ many }) => ({
  participants: many(participants),
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  events: many(eventParticipants),
  snack: one(snacks, { fields: [participants.snackPreference], references: [snacks.id] }),
}))

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(eventParticipants),
}))

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, { fields: [eventParticipants.eventId], references: [events.id] }),
  participant: one(participants, { fields: [eventParticipants.participantId], references: [participants.id] }),
}))

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // Simple description of the order
  createdAt: text('created_at').notNull(), // ISO 8601 string
})

// ─── Join table: order <-> snack (with quantity) ──────────────────────────────

export const orderSnacks = sqliteTable(
  'order_snacks',
  {
    orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    snackId: text('snack_id').notNull().references(() => snacks.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.orderId, t.snackId] })]
)

