import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const bookings = await db.collection('bookings').find()
  res.json(bookings)
  return;
})

router.get('/:id', async (req, res) => {
  const booking = await db.collection('bookings').findById(req.params.id!)
  if (!booking) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(booking)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('bookings').insertOne(body)
  const booking = await db.collection('bookings').findById(id)
  res.status(201).json(booking)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('bookings').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const booking = await db.collection('bookings').findById(req.params.id!)
  res.json(booking)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('bookings').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router