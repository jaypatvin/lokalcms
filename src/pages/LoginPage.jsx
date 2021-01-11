import React, { useState, useContext } from 'react'
import { Formik } from 'formik'
import { object, string } from 'yup'
import { useHistory } from 'react-router'

import { firebase } from '../services/firebase';
import { CurrentUserContext } from '../contexts/CurrentUserContext'
import { FormikTextField } from '../components/inputs'
import { Button } from '../components/buttons'

import { signIn } from '../services/users';

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
  let history = useHistory()

  const { currentUser, getCurrentUser } = useContext(CurrentUserContext)
  const [isError, setIsError] = useState(false)
  const [errors, setErrors] = useState({})

  getCurrentUser();

  // check if user already logged in
  if (!!currentUser) {
    history.push('/')
  }

  async function login(values) {
    const { email, password } = values

    signIn(email, password)
    .then(response => {
      console.log(response);
      getCurrentUser();
    })
    .catch(error => {
      console.log(error);
      setIsError(true)
      setErrors(error.message)
    });

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
    <div class="w-full max-w-xs m-auto bg-indigo-100 rounded p-5">
      <header>
        <img class="w-40 mx-auto mb-5" src={imgLogo} alt="Lokal Logo" />
      </header>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          login(values);
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