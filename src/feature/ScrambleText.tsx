import React, { useEffect, useState } from 'react'

type ScrambleTextProps = {
	text: string
}
const ScrambleText: React.FC<ScrambleTextProps> = ({ text }) => {
	const letters = '!@#$%^&*()_+-={}|[]:";<>?,.'
	const [headlineText, setHeadlineText] = useState(text)

	const handleScrambleText = () => {
		let iteration = 0
		let requestId: any = null
		const { length } = headlineText

		const scrambleText = () => {
			setHeadlineText((prevText) => {
				const scrambledText = prevText
					.split('')
					.map((_, index) => {
						if (index < iteration) {
							return text[index]
						}
						return letters[Math.floor(Math.random() * length)]
					})
					.join('')
				iteration += 1 / 10

				if (iteration >= length) {
					setHeadlineText(text)
					cancelAnimationFrame(requestId)
				}

				return scrambledText
			})
			requestId = requestAnimationFrame(scrambleText)
		}

		requestId = requestAnimationFrame(scrambleText)
	}

	useEffect(() => {
		setTimeout(function timer() {
			handleScrambleText()
			// setTimeout(timer, 5000)
		}, 0)
	}, [])

	return <h1>{headlineText}</h1>
}

export default ScrambleText
