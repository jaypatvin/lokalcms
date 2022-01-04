import * as admin from 'firebase-admin'
import faker from 'faker'

const db = admin.firestore()
const auth = admin.auth()

const seedUserData = async (userId: string) => {
  // create test shops for the user
  // try {
  //   for (let i = 1; i <= faker.datatype.number(3); i++) {
  //     await firestore().collection('shops').add({
  //       name: faker.company.companyName(),
  //       description: faker.company.catchPhrase()
  //     })
  //   }
  // } catch (error) {
  //   console.error(error, `Encountered an error while creating test shops for userId ${userId}`)
  // }
}

const seedAuthUsers = async () => {
  for (let i = 1; i <= 20; i++) {
    try {
      auth
        .createUser({
          email: faker.internet.email() ,
          emailVerified: true,
          password: 'lokalpassword',
          displayName: faker.name.findName(),
          disabled: false,
        })
    } catch (error) {
      console.error('Error creating new user:', error)
    }
  }
}

export const seedData = async () => {
  await seedAuthUsers()
}
