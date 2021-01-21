import React, { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import { Redirect, Link } from 'react-router-dom'

import { ConfirmationDialog } from './Dialog'
import { useAuth } from "../contexts/AuthContext"

import SideNav from './SideNav'
import imgLogo from '../static/img/logo.svg'

import {
  IoIosArrowDown
} from 'react-icons/io'

const BasePage = (props) => {
  
  const node = useRef()

  const [isClosed, setClosed] = useState(false)
  const [isLogout, setIsLogout] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const rootEl =  document.getElementById("root");

  const { currentUser, currentUserInfo, logout } = useAuth()

  console.log("BasePage:", currentUser, currentUserInfo)

  const isStatic = useMediaQuery ({
    query: '(min-width: 976px)'
  });

  const toggleSidenav = () => {
    setClosed(!isClosed)
    if (isClosed) {
      rootEl.classList.remove('show-nav')
    } else {
      rootEl.classList.add('show-nav')
    }
  }

  const toggleAvatar = (e) => {
    e.preventDefault()
    setIsAvatarOpen(!isAvatarOpen)
  }

  async function signOut() {
    logout()
    return <Redirect to="/login" />
  }

  const handleClick = e => {
    if (node.current.contains(e.target)) {
      // inside click
      return;
    }
    // outside click
    setIsAvatarOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);
 
  return (
    <>
      <ConfirmationDialog
        isOpen={isLogout}
        onClose={() => setIsLogout(false)}
        onAccept={() => signOut()}
        color="danger"
        title="Logout"
        descriptions="Are you sure want to logout from application?"
        acceptLabel="Logout"
        cancelLabel="Cancel"
      />

      <aside
        aria-hidden={isClosed}
        id="page-sidenav">
        <div className="p-4 h-16 flex items-center justify-between">
          <img className="w-32 mx-auto " src={imgLogo} alt="Lokal Logo" />
        </div>

        <SideNav/>

      </aside>

      <main id='page-container' className="flex-grow flex flex-col min-h-screen w-">
        <header className="bg-white border-b h-12 flex items-center justify-center">
          <div className="flex flex-grow items-center justify-between px-4">
            { !isStatic && (
          <button
              tabIndex="1"
              className="w-10 p-1"
              aria-label="Toggle menu"
              title="Toggle menu"
              onClick={() => toggleSidenav()}
            >
              <svg
                aria-hidden="true"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            )}

            <div>&nbsp;</div>
            

            <div ref={node} className="flex justify-center">

              <div className="relative">
                <button 
                  onClick={toggleAvatar}
                  className="flex flex-row rounded-full overflow-hidden focus:outline-none align-middle ">
                  <div className="block h-8 w-8 rounded-full overflow-hidden">
                    <img 
                      className="h-full w-full object-cover" 
                      src={"https://eu.ui-avatars.com/api/?name=" + encodeURI(currentUserInfo.display_name) + "&size=100"} 
                      alt="avatar" />
                  </div>
                  <span className="block h-8 leading-8 ml-1">
                    <IoIosArrowDown className="h-8" size={16} />
                  </span>
                </button>
            
                { isAvatarOpen ? (
                  <div className="absolute z-20 right-0 w-40 mt-2 py-2 bg-white border rounded shadow-xl ">
                    <Link 
                      onClick={(e) => {
                        setIsAvatarOpen(!isAvatarOpen);
                      }}
                      to={"/myaccount"}
                      className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-teal-400 hover:text-white"
                      >{currentUserInfo.display_name}</Link>
                    <div className="py-2">
                      <hr></hr>
                    </div>
                    <a 
                      className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-teal-400 hover:text-white"
                      href="/logout"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsAvatarOpen(false)
                        setIsLogout(true)
                      }}
                      >    
                      Logout
                    </a>
                  </div>
                ) : null }
              
              </div>
            
            </div>



            
          </div>
        </header>
        <div className="p-6 w-full min-h-full relative">{props.children}</div>
      </main>
    </>
  );

};

export default BasePage;