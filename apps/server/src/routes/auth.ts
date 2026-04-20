import { Router } from 'express'
import { db } from '../lib/db'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, role } = req.body as { email?: string; role?: string }
  if (!email || !role) {
     res.status(400).json({ error: 'Email and role are required' })
     return
  }
  
  const users = await db.collection('users').find({ email, role })
  if (users.length === 0) {
     const id = await db.collection('users').insertOne({
        email,
        name: email.split('@')[0] || 'User',
        role,
        joinedAt: new Date().toISOString(),
        token: Math.random().toString(36).substring(2)
     })
     const newUser = await db.collection('users').findById(id)
     res.json(newUser)
     return
  }
  
  res.json(users[0])
  return;
})

export default router