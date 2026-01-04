import { FC } from 'react'

import { Outlet } from 'react-router'

import Navbar from 'Components/Member/Menu/Navbar'

const MemberLayout: FC = () => {
	return (
		<>
			<Navbar />
			<Outlet />
		</>
	)
}

export default MemberLayout
