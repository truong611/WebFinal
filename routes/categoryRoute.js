// const router = require('express').Router()
// const categoryController = require('../controllers/categoryController')
// const auth = require('../../middleware/auth')
// const authAdmin = require('../../middleware/authAdmin')

// router.route('/category')
//     .get(categoryController.getCategory)
//     .post(auth, authAdmin, categoryController.createCategory)
// // router.get('/category', categoryController.getCategory)
// // router.post('/category', auth, authAdmin, categoryController.getCategory)

// router.route('/category/:id')
//     .delete(auth, authAdmin, categoryController.deleteCategory)
//     .put(auth, authAdmin, categoryController.updateCategory)

module.exports = router;
