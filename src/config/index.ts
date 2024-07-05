export const linksSocial = [
	{
		href: 'https://github.com/drozdovdn',
		title: 'github'
	},
	{
		href: 'https://leetcode.com/u/drozdovdn',
		title: 'leetcode'
	},
	{
		href: 'https://t.me/drozdov_dn',
		title: 'telegram'
	}
]

export const getDateWork = () => {
	const startWork = '2020'
	return new Date().getFullYear() - new Date(startWork).getFullYear()
}
