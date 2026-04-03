import express from 'express'

import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from './../controllers/userController'
import {
  login,
  signUp,
  forgotPassword,
  resetPassword,
} from '../controllers/authController'

const router = express.Router()

router.route('/signup').post(signUp)
router.route('/login').post(login)

router.route('/forgot-password').post(forgotPassword)

router.route('/reset-password/:token').patch(resetPassword)

router.route('/').get(getAllUsers).post(createUser)

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export { router }
