import React, { useState, useEffect } from 'react'
import * as dayjs from 'dayjs'
import * as relativeTime from 'dayjs/plugin/relativeTime'

import { auth, db } from '../../services/firebase'
import { Button } from '../../components/buttons'
import MenuList from '../../components/MenuList'
import Avatar from '../../components/Avatar'


import { getUsers, getAuthUserByUID } from '../../services/users'


// Init
dayjs.extend(relativeTime);


const UserListPage = (props) => {

  const [userList, setUserList] = useState([])
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchText, setSearchText] = useState("")
  const [sortBy, setSortBy] = useState("first_name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [limit, setLimit] = useState(50)


  const menuItems = [
    {
      key: 'all',
      name: 'All Users',
      onClick: (e, item) => {
        console.log(e, item);
        setSelectedRole('all')
      }
    },
    {
      key: 'admins',
      name: 'Admins',
      onClick: (e, item) => {
        console.log(e, item);
        setSelectedRole('admin')
      }
    },
    {
      key: 'members',
      name: 'Members',
      onClick: (e, item) => {
        console.log(e, item);
        setSelectedRole('member')
      }
    }
  ]


  useEffect(() => {

    console.log(selectedRole);
    getUsers(selectedRole, searchText, sortBy, sortOrder, limit).onSnapshot((snapshot) => {
      setUserList(snapshot.docs.map((doc) => {
        let _data = doc.data()
        _data.id = doc.id
        return _data
      }))
    })

  }, [selectedRole, searchText, sortBy, sortOrder, limit])


 
  return (

<div class="flex flex-row w-full">
  <div className="flex flex-row w-52 hidden mdl:block">
    <div className="pb-5">
      <h2 class="text-2xl font-semibold leading-tight">Users</h2>
    </div>
    <div>
      <MenuList items={menuItems} selected={"all"} />
    </div>
    
  </div>
  <div class="pb-8 flex-grow">
    <div class="-mb-2 pb-2 flex flex-wrap flex-grow justify-between">
      <div class="flex items-center">
        <input class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-searcg" type="text" placeholder="Search" />
      </div>
      <div class="flex items-center">
        <Button 
          icon="add"
          size="small"
          onClick={(e) => {
            e.preventDefault()
            console.log('Add User');
            return false
          }}
          >
          New User
        </Button>
      </div>
    </div>
    <div className="table-wrapper">
      <div className="table-container" >
        <table >
          <thead>
            <tr>
              <th>
                User
              </th>
              <th>
                Community
              </th>
              <th>
                Status
              </th>
              <th >
                Member Since
              </th>
              <th className="action-col"></th>
            </tr>
          </thead>
          <tbody>

          {userList.map(user => {

            console.log(user)
            let _created_at = "-"
            let _created_at_ago = "-"
            if (user.created_at) {
              //_created_at = new Date(user.created_at.seconds * 1000).toLocaleDateString("en-US")
              _created_at = dayjs(user.created_at.toDate())
              _created_at_ago = dayjs(_created_at).fromNow()
            }
            
            const display_name = String(user.display_name).trim().length > 0 && typeof user.display_name !== "undefined" ? user.display_name : user.first_name + ' ' + user.last_name
            let statusColor = 'gray'
            let statusText = 'Active'
            const _status = String(user.status).trim().length > 0 && typeof user.status !== "undefined" ? user.status : 'undefined'

            switch (String(_status).toLowerCase()) {
              case 'active': 
                statusColor = 'green'
                statusText = 'Active'
                break
              case 'suspended': 
                statusColor = 'red'
                statusText = 'Suspended'
                break
              case 'pending': 
                statusColor = 'yellow'
                statusText = 'Pending'
                break
              case 'locked': 
                statusColor = 'gray'
                statusText = 'Locked'
                break
              default:
                statusColor = 'gray'
                break

            }


            return (
              <tr>
                <td >
                  <div class="flex">
                    
                    <Avatar url={user.profile_photo} name={display_name} size={10} statusColor={statusColor} />
                    <div class="ml-3">
                      <p class="text-gray-900 whitespace-no-wrap">
                        {display_name}
                      </p>
                      <p class="text-gray-600 whitespace-no-wrap">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td >
                  <p class="text-gray-900 whitespace-no-wrap">{user.community_id}</p>
                  <p class="text-gray-600 whitespace-no-wrap">{""}</p>
                </td>
                <td>
                  <span
                    className={"relative inline-block px-3 py-1 font-semibold text-" + statusColor + "-900 leading-tight"}
                  >
                    <span
                      aria-hidden
                      className={"absolute inset-0 bg-" + statusColor + "-200 opacity-50 rounded-full"}
                    ></span>
                    <span class="relative">{statusText}</span>
                  </span>
                </td>
                <td title={ _created_at === '-' ? '-' : _created_at.format() } >
                  <p class="text-gray-900 whitespace-no-wrap">{ _created_at_ago }</p>
                  <p class="text-gray-600 whitespace-no-wrap">{""}</p>
                </td>
                
                <td
                  className="action-col"
                >
                  <button
                    type="button"
                    class="inline-block text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      class="inline-block h-6 w-6 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            )

          })}
            
            
            
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>



  );

};

export default UserListPage;