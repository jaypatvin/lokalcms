import React, { useState} from 'react'
import { Formik } from 'formik'
import { object, string } from 'yup'

import { useAuth } from "../contexts/AuthContext"
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

const LoginPage = (props) => {
  
  const { login, withError, errorMsg, setRedirect } = useAuth()
  const [isError, setIsError] = useState(false)
  const [errors, setErrors] = useState({})

  console.log('Login - error:', withError, errorMsg)

  async function loginHandle(values) {
    const { email, password } = values

    try {
      
      setIsError(false)
      setErrors('')

      setRedirect('/')
      await login(email, password)
     // history.push("/")

    } catch (error) {

      console.log(error)
      setIsError(true)
      setErrors(error.message)
    }

    // signIn(email, password)
    // .then(response => {
    //   console.log(response);
    //   getCurrentUser();
    // })
    // .catch(error => {
    //   console.log(error);
    //   setIsError(true)
    //   setErrors(error.message)
    // });

    // try {
    //   const response = await signIn(email, password);
    //   if (response.user.uid) {
    //     //getCurrentUser();
    //     //history.push('/')
    //   }
    // } catch (error) {
    //   setIsError(true)
    //   setErrors(error.message)
    // }

  }


  return (
    <div className="w-full max-w-xs m-auto bg-indigo-100 rounded p-5">
      <header>
        <img className="w-40 mx-auto mb-5" src={imgLogo} alt="Lokal Logo" />
      </header>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          loginHandle(values);
          actions.setSubmitting(false);
          actions.resetForm(initialValues);
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

            {withError && (
              <p className="text-red-500 mb-5 italic">
                { errorMsg }
              </p>
            )}

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
  );

};

export default LoginPage;