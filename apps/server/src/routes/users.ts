import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const users = await db.collection('users').find()
  res.json(users)
  return;
})

router.get('/:id', async (req, res) => {
  const user = await db.collection('users').findById(req.params.id!)
  if (!user) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(user)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('users').insertOne({ ...body, joinedAt: body.joinedAt || new Date().toISOString() })
  const user = await db.collection('users').findById(id)
  res.status(201).json(user)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('users').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const user = await db.collection('users').findById(req.params.id!)
  res.json(user)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('users').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router