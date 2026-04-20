import { Router } from 'express'
import { db } from '../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  const userMemberships = await db.collection('userMemberships').find()
  res.json(userMemberships)
  return;
})

router.get('/:id', async (req, res) => {
  const membership = await db.collection('userMemberships').findById(req.params.id!)
  if (!membership) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(membership)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('userMemberships').insertOne(body)
  const membership = await db.collection('userMemberships').findById(id)
  res.status(201).json(membership)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('userMemberships').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const membership = await db.collection('userMemberships').findById(req.params.id!)
  res.json(membership)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('userMemberships').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router