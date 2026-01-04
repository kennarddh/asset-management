import { FC } from 'react'

import { useTranslation } from 'react-i18next'

import PageContainer from 'Components/Admin/PageContainer'

const Home: FC = () => {
	const { t } = useTranslation('admin_home')

	return <PageContainer title={t('admin_home:title')}>{t('admin_home:title')}</PageContainer>
}

export default Home

export { Home as Component }
