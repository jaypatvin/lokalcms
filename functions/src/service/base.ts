import {
  addDoc,
  CollectionReference,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
  setDoc,
  Timestamp,
  UpdateData,
  updateDoc,
  where,
  limit,
  QuerySnapshot,
} from 'firebase/firestore'

interface Option {
  wheres: QueryConstraint[]
}

export const findAll = async <T>(ref: CollectionReference<T>, option?: Option) => {
  let docsRef: QuerySnapshot<T>
  if (option?.wheres.length) {
    const q = query(ref, ...option.wheres)
    docsRef = await getDocs(q)
  } else {
    docsRef = await getDocs(ref)
  }
  return docsRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findOne = async <T>(ref: CollectionReference<T>, option?: Option) => {
  let docsRef: QuerySnapshot<T>
  if (option?.wheres.length) {
    const q = await query(ref, ...option.wheres, limit(1))
    docsRef = await getDocs(q)
  } else {
    docsRef = await getDocs(ref)
  }

  const firstDoc = docsRef.docs[0]
  return { id: firstDoc.id, ...firstDoc.data() }
}

export const findById = async <T>(ref: CollectionReference<T>, id: string) => {
  if (!id) return null

  const docRef = doc(ref, id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
  return null
}

export const findByCommunityId = async <T>(ref: CollectionReference<T>, id: string) => {
  if (!id) return null

  const q = await query(ref, where('community_id', '==', id))
  const docsRef = await getDocs(q)
  return docsRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const create = async <T, U>(ref: CollectionReference<T>, data: U) => {
  const docRef = await addDoc(
    ref as CollectionReference<T & { created_at: Timestamp; updated_at: Timestamp }>,
    {
      ...(data as Partial<T>),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }
  )

  const doc = await getDoc(docRef)
  return { id: doc.id, ...doc.data() }
}

export const createById = async <T, U>(ref: CollectionReference<T>, id: string, data: U) => {
  await setDoc(
    doc(ref as CollectionReference<T & { created_at: Timestamp; updated_at: Timestamp }>, id),
    {
      ...(data as Partial<T>),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }
  )

  const updatedDoc = await getDoc(doc(ref, id))
  return { id: updatedDoc.id, ...updatedDoc.data() }
}

export const update = async <T, U>(ref: CollectionReference<T>, id: string, data: U) => {
  if (!id) return null

  const docRef = doc(ref as CollectionReference<T & { updated_at: Timestamp }>, id)
  const updateData = {
    ...data,
    updated_at: Timestamp.now(),
  } as UpdateData<Partial<T> & { updated_at: Timestamp }>

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(doc(ref, id))
  return { id: updatedDoc.id, ...updatedDoc.data() }
}

export const archive = async <T, U>(ref: CollectionReference<T>, id: string, data?: U) => {
  if (!id) return null

  const docRef = doc(
    ref as CollectionReference<
      T & { updated_at: Timestamp; archived: boolean; archived_at: Timestamp }
    >,
    id
  )
  const updateData = {
    archived: true,
    archived_at: Timestamp.now(),
    updated_at: Timestamp.now(),
    ...(data ? { ...data } : {}),
  }

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(doc(ref, id))
  return { id: updatedDoc.id, ...updatedDoc.data() }
}

export const unarchive = async <T, U>(ref: CollectionReference<T>, id: string, data?: U) => {
  if (!id) return null

  const docRef = doc(
    ref as CollectionReference<T & { updated_at: Timestamp; archived: boolean }>,
    id
  )
  const updateData = {
    archived: false,
    updated_at: Timestamp.now(),
    ...(data ? { ...data } : {}),
  }

  await updateDoc(docRef, updateData)

  const updatedDoc = await getDoc(doc(ref, id))
  return { id: updatedDoc.id, ...updatedDoc.data() }
}

export const createBaseMethods = <T>(ref: CollectionReference<T>) => ({
  findAll: (option?: Option) => findAll(ref, option),
  findOne: (option?: Option) => findOne(ref, option),
  findById: (id: string) => findById(ref, id),
  findByCommunityId: (id: string) => findByCommunityId(ref, id),
  create: <U>(data: U) => create(ref, data),
  createById: <U>(id: string, data: U) => createById(ref, id, data),
  update: <U>(id: string, data: U) => update(ref, id, data),
  archive: <U>(id: string, data?: U) => archive(ref, id, data),
  unarchive: <U>(id: string, data?: U) => unarchive(ref, id, data),
})
