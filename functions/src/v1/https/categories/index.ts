/**
 * @openapi
 * components:
 *   schemas:
 *     Categories:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon_url:
 *           type: string
 *         cover_url:
 *           type: string
 *         status:
 *           type: string
 */

// used only in create, could move it there
// if there are no other fields
export const required_fields = ['name']

export { default as createCategory } from './createCategory'
export { default as updateCategory } from './updateCategory'
export { default as deleteCategory } from './deleteCategory'
export { default as enableCategory } from './enableCategory'
export { default as getCategory } from './getCategory'
export { default as getCategories } from './getCategories'
