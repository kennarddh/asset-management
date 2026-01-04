import { FC } from 'react'

import { Outlet } from 'react-router'

import Navbar from 'Components/Member/Navbar'

const MemberLayout: FC = () => {
	return (
		<>
			<Navbar />
			<Outlet />
		</>
	)
}

export default MemberLayout
