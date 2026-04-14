import express from 'express'
import {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} from '@modules/auth/auth.controller'
import { protect } from '@modules/auth/auth.controller'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)

router.use(protect)
router.patch('/update-password', updatePassword)

export { router }
