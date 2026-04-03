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
  updatePassword,
  protect,
} from '../controllers/authController'

const router = express.Router()

router.route('/signup').post(signUp)
router.route('/login').post(login)

router.route('/forgot-password').post(forgotPassword)

router.route('/reset-password/:token').patch(resetPassword)

router.route('/update-password').patch(protect, updatePassword)

router.route('/').get(getAllUsers).post(createUser)

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export { router }
