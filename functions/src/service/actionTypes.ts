import { ActionType } from '../models'
import db from '../utils/db'
import { createBaseMethods } from './base'

const { findAll, findById, createById: baseCreateById } = createBaseMethods(db.actionTypes)

export { findAll, findById }

export const create = (id: string, data: ActionType) => baseCreateById(id, data)
