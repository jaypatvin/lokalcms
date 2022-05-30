import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  MouseEventHandler,
  createContext,
  useContext,
} from 'react'
import { useMediaQuery } from 'react-responsive'
import { Redirect, Link } from 'react-router-dom'

import { ConfirmationDialog } from './Dialog'
import { useAuth } from '../contexts/AuthContext'
import Avatar from './Avatar'

import SideNav from './SideNav'
import imgLogo from '../static/img/logo.svg'

import { IoIosArrowDown } from 'react-icons/io'
import useOuterClick from '../customHooks/useOuterClick'
import { getCommunities } from '../services/community'
import { TextField } from './inputs'
import { Community } from '../models'

type Props = {
  children: ReactNode
}
type CommunityData = Community & { id: string }

const CommunityContext = createContext<CommunityData>({} as CommunityData)
const CommunitiesContext = createContext<CommunityData[]>([])

export function useCommunity() {
  return useContext(CommunityContext)
}

export function useCommunities() {
  return useContext(CommunitiesContext)
}

const BasePage = (props: Props) => {
  const node = useRef<HTMLDivElement>(null)

  const [isClosed, setClosed] = useState(false)
  const [isLogout, setIsLogout] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const rootEl = document.getElementById('root')

  const { currentUserInfo, logout, firebaseToken } = useAuth()

  const [community, setCommunity] = useState<CommunityData>({} as CommunityData)
  const [communities, setCommunities] = useState<CommunityData[]>([])
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<CommunityData[]>([])

  const isStatic = useMediaQuery({
    query: '(min-width: 1199px)',
  })

  const toggleSidenav = () => {
    setClosed(!isClosed)
    if (!rootEl) return
    if (isClosed) {
      rootEl.classList.remove('show-nav')
    } else {
      rootEl.classList.add('show-nav')
    }
  }

  const toggleAvatar: MouseEventHandler = (e) => {
    e.preventDefault()
    setIsAvatarOpen(!isAvatarOpen)
  }

  async function signOut() {
    if (logout) logout()
    return <Redirect to="/login" />
  }

  const handleClick = (e: any) => {
    if (node.current && node.current.contains(e.target)) {
      // inside click
      return
    }
    // outside click
    setIsAvatarOpen(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    if (firebaseToken) {
      getCommunities({}, firebaseToken)
        .then((res) => {
          if (res && res.data) {
            setCommunities(res.data)
            setCommunitySearchResult(res.data)
          }
        })
    }

    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const communitySearchHandler = (value: string) => {
    setCommunitySearchText(value)
    const filteredCommunities = communities.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    )
    setCommunitySearchResult(filteredCommunities)
    setShowCommunitySearchResult(filteredCommunities.length > 0)
  }

  const communitySelectHandler = (community: CommunityData) => {
    setShowCommunitySearchResult(false)
    setCommunitySearchResult([])
    setCommunity(community)
    setCommunitySearchText(community.name!)
  }

  const clearSelectedCommunity = () => {
    setShowCommunitySearchResult(false)
    setCommunitySearchResult([])
    setCommunity({} as CommunityData)
    setCommunitySearchText('')
  }

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

      <aside aria-hidden={isClosed} id="page-sidenav">
        <div className="p-4 h-16 flex items-center justify-between">
          <img className="w-32 mx-auto " src={imgLogo} alt="Lokal Logo" />
        </div>

        <SideNav />
      </aside>

      <main id="page-container" className="flex-grow flex flex-col min-h-screen w-">
        <header className="bg-white border-b h-16 flex items-center justify-center">
          <div className="flex flex-grow items-center justify-between px-4">
            {!isStatic && (
              <button
                tabIndex={1}
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
              <div ref={communitySearchResultRef} className="relative mr-5 z-20">
                <TextField
                  required
                  type="text"
                  size="small"
                  placeholder="Community"
                  onChange={(e) => communitySearchHandler(e.target.value)}
                  value={communitySearchText}
                  onFocus={() => communitySearchHandler(communitySearchText)}
                  noMargin
                />
                {showCommunitySearchResult && communitySearchResult.length > 0 && (
                  <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
                    <button
                      className="w-full p-1 hover:bg-gray-200 block text-left"
                      onClick={clearSelectedCommunity}
                    >
                      --
                    </button>
                    {communitySearchResult.map((community) => (
                      <button
                        className="w-full p-1 hover:bg-gray-200 block text-left"
                        key={community.id}
                        onClick={() => communitySelectHandler(community)}
                      >
                        {community.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={toggleAvatar}
                  className="flex flex-row rounded-full overflow-hidden focus:outline-none align-middle "
                >
                  <Avatar
                    url={currentUserInfo?.profile_photo}
                    name={currentUserInfo?.display_name}
                    size={8}
                    statusColor="green"
                  />
                  <span className="block h-8 leading-8 ml-1">
                    <IoIosArrowDown className="h-8" size={16} />
                  </span>
                </button>

                {isAvatarOpen ? (
                  <div className="absolute z-20 right-0 w-40 mt-2 py-2 bg-white border rounded shadow-xl ">
                    <Link
                      onClick={(e) => {
                        setIsAvatarOpen(!isAvatarOpen)
                      }}
                      to={`/users/${currentUserInfo?.id}`}
                      className="transition-colors duration-200 block px-4 py-2 text-normal text-gray-900 rounded hover:bg-teal-400 hover:text-white"
                    >
                      {currentUserInfo?.display_name}
                    </Link>
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
                ) : null}
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 w-full min-h-full relative">
          <CommunitiesContext.Provider value={communities}>
            <CommunityContext.Provider value={community}>
              {props.children}
            </CommunityContext.Provider>
          </CommunitiesContext.Provider>
        </div>
      </main>
    </>
  )
}

export default BasePage
