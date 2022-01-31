import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'

const TestPage = () => {
  const [isClosed, setClosed] = useState(false)
  const rootEl = document.getElementById('root')

  const isStatic = useMediaQuery({
    query: '(min-width: 976px)',
  })

  const toggleSidenav = () => {
    if (!rootEl) return
    setClosed(!isClosed)
    if (isClosed) {
      rootEl.classList.remove('show-nav')
    } else {
      rootEl.classList.add('show-nav')
    }
  }

  return (
    <>
      <aside aria-hidden={isClosed} id="page-sidenav">
        <div className="bg-white border-r border-b px-4 h-12 flex items-center justify-between">
          <span className="text-blue py-2">Application</span>
        </div>

        <div className="border-r py-4 flex-grow">
          <nav>
            <ul>
              <li className="p-3">
                <a href=""> Home </a>
              </li>
              <li className="p-3">
                <a href=""> Profile </a>
              </li>
              <li className="p-3">
                <a href=""> Portfolio </a>
              </li>
              <li className="p-3">
                <a href=""> Contact </a>
              </li>
              <li className="p-3">
                <a href=""> About </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <main id="page-container" className="flex-grow flex flex-col min-h-screen w-">
        <header className="bg-white border-b h-12 flex items-center justify-center">
          <div className="flex flex-grow items-center justify-between px-3">
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

            <h1 className="text-lg">Home</h1>
            <button className="text-blue-700 underline">Log in</button>
          </div>
        </header>
      </main>
    </>
  )
}

export default TestPage
