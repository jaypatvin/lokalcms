import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import { get } from 'lodash'
import * as functions from 'firebase-functions'
import { User } from '../models'

type RolesType = {
  admin?: boolean
  editor?: boolean
  member?: boolean
}

const search: RequestHandler = async (req, res, next) => {
  const { userRoles, userDoc } = res.locals as {
    userRoles: RolesType
    userDoc: User & { id: string }
  }

  const APP_ID = get(functions.config(), 'algolia_config.app_id')
  const API_KEY = get(functions.config(), 'algolia_config.api_key')
  const SEARCH_KEY = get(functions.config(), 'algolia_config.search_key')
  const client = algoliasearch(APP_ID, API_KEY)

  const params = {
    ...(!userRoles.admin ? { filters: `community_id:${userDoc.community_id}` } : {}),
    userToken: userDoc.id,
  }

  const key = client.generateSecuredApiKey(SEARCH_KEY, params)

  res.locals.searchKey = key

  next()
  return
}

export const orderSearch: RequestHandler = async (req, res, next) => {
  const { userRoles, userDoc } = res.locals as {
    userRoles: RolesType
    userDoc: User & { id: string }
  }

  const APP_ID = get(functions.config(), 'algolia_config.app_id')
  const API_KEY = get(functions.config(), 'algolia_config.api_key')
  const SEARCH_KEY = get(functions.config(), 'algolia_config.search_key')
  const client = algoliasearch(APP_ID, API_KEY)

  const params = {
    ...(!userRoles.admin
      ? {
          filters: `community_id:${userDoc.community_id} AND (seller_id:${userDoc.id} OR buyer_id:${userDoc.id})`,
        }
      : {}),
    userToken: userDoc.id,
  }

  const key = client.generateSecuredApiKey(SEARCH_KEY, params)

  res.locals.searchKey = key

  next()
  return
}

export const chatSearch: RequestHandler = async (req, res, next) => {
  const { userRoles, userDoc } = res.locals as {
    userRoles: RolesType
    userDoc: User & { id: string }
  }

  const APP_ID = get(functions.config(), 'algolia_config.app_id')
  const API_KEY = get(functions.config(), 'algolia_config.api_key')
  const SEARCH_KEY = get(functions.config(), 'algolia_config.search_key')
  const client = algoliasearch(APP_ID, API_KEY)

  const params = {
    ...(!userRoles.admin
      ? { filters: `community_id:${userDoc.community_id} AND members:${userDoc.id}` }
      : {}),
    userToken: userDoc.id,
  }

  const key = client.generateSecuredApiKey(SEARCH_KEY, params)

  res.locals.searchKey = key

  next()
  return
}

export const conversationSearch: RequestHandler = async (req, res, next) => {
  const { userRoles, userDoc } = res.locals as {
    userRoles: RolesType
    userDoc: User & { id: string }
  }

  const APP_ID = get(functions.config(), 'algolia_config.app_id')
  const API_KEY = get(functions.config(), 'algolia_config.api_key')
  const SEARCH_KEY = get(functions.config(), 'algolia_config.search_key')
  const client = algoliasearch(APP_ID, API_KEY)

  const params = {
    ...(!userRoles.admin
      ? { filters: `community_id:${userDoc.community_id} AND sender_id:${userDoc.id}` }
      : {}),
    userToken: userDoc.id,
  }

  const key = client.generateSecuredApiKey(SEARCH_KEY, params)

  res.locals.searchKey = key

  next()
  return
}

export const reportSearch: RequestHandler = async (req, res, next) => {
  const { userRoles, userDoc } = res.locals as {
    userRoles: RolesType
    userDoc: User & { id: string }
  }

  const APP_ID = get(functions.config(), 'algolia_config.app_id')
  const API_KEY = get(functions.config(), 'algolia_config.api_key')
  const SEARCH_KEY = get(functions.config(), 'algolia_config.search_key')
  const client = algoliasearch(APP_ID, API_KEY)

  const params = {
    ...(!userRoles.admin
      ? {
          filters: `community_id:${userDoc.community_id} AND (user_id:${userDoc.id} OR reported_user_id:${userDoc.id})`,
          attributesToRetrieve: ['*', '-user_id', '-reporter_email'],
        }
      : {}),
    userToken: userDoc.id,
  }

  const key = client.generateSecuredApiKey(SEARCH_KEY, params)

  res.locals.searchKey = key

  next()
  return
}

export default search
