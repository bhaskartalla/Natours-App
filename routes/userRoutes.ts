import express from 'express'
import {
  getAllUsers,
  createUser,
  getUser,
  deleteUser,
  deleteMe,
  updateMe,
  updateUser,
  getMe,
  updateUserPhoto,
  resizeUserPhoto,
} from './../controllers/userController'
import {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} from '../controllers/authController'

const router = express.Router()

router.route('/signup').post(signUp)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').patch(resetPassword)

// Protect all routes after this middleware
router.use(protect)

router.route('/update-password').patch(updatePassword)
router.route('/me').get(getMe, getUser)
router.route('/delete-me').delete(deleteMe)
router.route('/update-me').patch(updateUserPhoto, resizeUserPhoto, updateMe)

// Restrict other to use below routes after this middleware
router.use(restrictTo('admin'))
router.route('/').get(getAllUsers).post(createUser)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

export { router }
