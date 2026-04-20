import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

router.get('/', async (req, res) => {
  const membershipPlans = await db.collection('membershipPlans').find()
  res.json(membershipPlans)
  return;
})

router.get('/:id', async (req, res) => {
  const plan = await db.collection('membershipPlans').findById(req.params.id!)
  if (!plan) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(plan)
  return;
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const id = await db.collection('membershipPlans').insertOne(body)
  const plan = await db.collection('membershipPlans').findById(id)
  res.status(201).json(plan)
  return;
})

router.put('/:id', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const ok = await db.collection('membershipPlans').updateOne(req.params.id!, body)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  const plan = await db.collection('membershipPlans').findById(req.params.id!)
  res.json(plan)
  return;
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('membershipPlans').deleteOne(req.params.id!)
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true })
  return;
})

export default router