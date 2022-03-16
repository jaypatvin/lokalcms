import { RequestHandler } from 'express'
import { ErrorCode, generateCommunityKeywords, generateError } from '../../../utils/generators'
import { CommunityService } from '../../../service'
import { CommunityCreateData } from '../../../models/Community'

/**
 * @openapi
 * /v1/community:
 *   post:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new community
 *       # Examples
 *       ```
 *       {
 *         "name": "Riverdale",
 *         "barangay": "mangahan",
 *         "city": "taguig",
 *         "state": "metro manila",
 *         "subdivision": "riverdale highlands",
 *         "zip_code": "4102",
 *         "country": "Philippines",
 *         "profile_photo": "url_of_the_photo",
 *         "cover_photo": "url_of_the_photo"
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 required: true
 *               barangay:
 *                 type: string
 *                 required: true
 *               city:
 *                 type: string
 *                 required: true
 *               state:
 *                 type: string
 *                 required: true
 *               subdivision:
 *                 type: string
 *                 required: true
 *               zip_code:
 *                 type: string
 *                 required: true
 *               country:
 *                 type: string
 *                 required: true
 *               profile_photo:
 *                 type: string
 *               cover_photo:
 *                 type: string
 *     responses:
 *       200:
 *         description: The new community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 */
const createCommunity: RequestHandler = async (req, res, next) => {
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor) {
    return next(
      generateError(ErrorCode.CommunityApiError, {
        message: 'User does not have a permission to create a community',
      })
    )
  }

  // check if community name already exist
  const existing_communities = await CommunityService.getCommunitiesByNameAndAddress({
    name: data.name,
    subdivision: data.subdivision,
    barangay: data.barangay,
    city: data.city,
    zip_code: data.zip_code,
  })

  if (existing_communities.length) {
    return next(
      generateError(ErrorCode.CommunityApiError, {
        message: `Community "${data.name}" already exists with the same address`,
      })
    )
  }

  const keywords = generateCommunityKeywords({
    name: data.name,
    subdivision: data.subdivision,
    city: data.city,
    barangay: data.barangay,
    state: data.state,
    country: data.country,
    zip_code: data.zip_code,
  })

  // create new community
  const newData: CommunityCreateData = {
    name: data.name,
    address: {
      barangay: data.barangay,
      city: data.city,
      state: data.state,
      subdivision: data.subdivision,
      zip_code: data.zip_code,
      country: data.country,
    },
    keywords,
    archived: false,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }
  if (data.profile_photo) {
    newData.profile_photo = data.profile_photo
  }
  if (data.cover_photo) {
    newData.cover_photo = data.cover_photo
  }

  const new_community = await CommunityService.createCommunity(newData)
  const result = await new_community.get().then((doc) => ({ ...doc.data(), id: doc.id }))

  return res.json({ status: 'ok', data: result })
}

export default createCommunity
