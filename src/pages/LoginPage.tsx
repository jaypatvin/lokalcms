import React, { useState } from 'react'
import { Formik } from 'formik'
import { object, string } from 'yup'

import { useAuth } from '../contexts/AuthContext'
import { FormikTextField } from '../components/inputs'
import { Button } from '../components/buttons'

import imgLogo from '../static/img/logo.svg'

const initialValues = {
  email: '',
  password: '',
}

const loginValidation = object().shape({
  email: string()
    .required('Please enter your email')
    .email('Please enter your valid email address'),
  password: string().required('Please enter your password'),
})

const LoginPage = (props: any) => {
  const { login, withError, errorMsg, setRedirect } = useAuth()
  const [isError, setIsError] = useState(false)
  const [errors, setErrors] = useState<any>({})

  console.log('Login - error:', withError, errorMsg)

  async function loginHandle(values: any) {
    const { email, password } = values

    try {
      setIsError(false)
      setErrors({})

      if (setRedirect) setRedirect('/')
      if (login) await login(email, password)
      // history.push("/")
    } catch (error) {
      console.error(error)
      setIsError(true)
      setErrors(error)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-full max-w-xs m-auto bg-indigo-100 rounded-md p-5">
        <header>
          <img className="w-40 mx-auto mb-5" src={imgLogo} alt="Lokal Logo" />
        </header>
        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            loginHandle(values)
            actions.setSubmitting(false)
            actions.resetForm({})
          }}
          validationSchema={loginValidation}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              {isError && (
                <p className="text-red-500 mb-5 italic">
                  Login failed, <br /> Please check your email & password
                </p>
              )}

              {withError && <p className="text-red-500 mb-5 italic">{errorMsg}</p>}

              <FormikTextField
                type="email"
                label="Email"
                name="email"
                placeholder="user@mail.com"
                error={errors.email}
              />

              <FormikTextField
                type="password"
                name="password"
                label="Password"
                placeholder="*************"
                error={errors.password}
              />

              <div>
                <Button
                  block
                  color="primary"
                  type="submit"
                  disabled={!props.isValid}
                  loading={props.isSubmitting}
                >
                  LOGIN
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default LoginPage
