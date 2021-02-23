import { Request, Response } from 'express'
import { UsersService, ShopsService } from '../../../service'

const archiveUser = async (req: Request, res: Response) => {
  const data = req.body
  if (!data.id) return res.status(400).json({ status: 'error', message: 'User ID is required!' })
  const { id: user_id, display_name } = data

  // archive the user
  const result = await UsersService.archiveUser(user_id)

  // archive the shops of the user
  const shops_update = await ShopsService.setShopsStatusOfUser(user_id, 'archived')

  return res.json({
    status: 'ok',
    data: result,
    shops_update,
    message: `User ${display_name || user_id} successfully archived.`,
  })
}

export default archiveUser
